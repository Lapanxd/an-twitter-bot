import fs from 'fs';
import path from 'path';
import axios from 'axios';
import unzipper from 'unzipper';
import logger from '../../utils/logger';
import {Repository} from 'typeorm';
import {Vote} from '../entities/vote.entity';
import {voteRepository} from '../container';

export class FetchVotesUseCase {
  static #instance: FetchVotesUseCase;

  private readonly jsonZipUrl =
    'http://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip';
  private readonly outputDir = path.resolve(process.cwd(), 'src/data/scrutins');

  private constructor(private readonly voteRepository: Repository<Vote>) {
  }

  static get instance(): FetchVotesUseCase {
    if (!FetchVotesUseCase.#instance) {
      FetchVotesUseCase.#instance = new FetchVotesUseCase(voteRepository);
    }
    return FetchVotesUseCase.#instance;
  }

  async execute(): Promise<void> {
    let lastVoteNumber = 0;

    const lastVote = await this.voteRepository.findOne({
      where: {},
      order: {number: 'DESC'},
    });

    if (lastVote) {
      lastVoteNumber = lastVote.number;
    }

    await this.createOutputDir();
    const zipPath = await this.downloadZip();
    await this.extractZip(zipPath);
    await this.cleanup(zipPath);

    logger.info(`ZIP downloaded and extracted to ${this.outputDir}`);

    await this.removeOldScrutins(lastVoteNumber);

    logger.info(`Old scrutins removed up to vote number ${lastVoteNumber}`);
  }

  private async removeOldScrutins(lastTreatedVoteNumber: number): Promise<void> {
    const dir = path.join(this.outputDir, 'json');
    if (!fs.existsSync(dir)) return;

    fs.readdirSync(dir).forEach((file) => {
      const match = file.match(/V(\d+)\.json$/i);
      const num = match ? parseInt(match[1], 10) : null;
      if (num !== null && num < lastTreatedVoteNumber + 1) {
        fs.unlinkSync(path.join(dir, file));
      }
    });
  }

  private async createOutputDir(): Promise<void> {
    fs.mkdirSync(this.outputDir, {recursive: true});
    logger.info(`Output directory ensured at ${this.outputDir}`);
  }

  private async downloadZip(): Promise<string> {
    const zipPath = path.join(this.outputDir, 'scrutins.zip');
    logger.info(`Starting download from ${this.jsonZipUrl}`);

    const response = await axios.get(this.jsonZipUrl, {
      responseType: 'stream',
      headers: {'User-Agent': 'Mozilla/5.0 (compatible; FetchVotesUseCase/1.0)'},
    });

    const writer = fs.createWriteStream(zipPath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    logger.info(`Download complete: ${zipPath}`);
    return zipPath;
  }

  private async extractZip(zipPath: string): Promise<void> {
    logger.info(`Extracting ZIP file: ${zipPath}`);
    await fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({path: this.outputDir}))
      .promise();
    logger.info(`Extraction complete to ${this.outputDir}`);
  }

  private async cleanup(zipPath: string): Promise<void> {
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
      logger.info(`Deleted ZIP file: ${zipPath}`);
    } else {
      logger.warn(`ZIP file not found for deletion: ${zipPath}`);
    }
  }
}
