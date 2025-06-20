import fs from 'fs';
import path from 'path';
import {VoteType} from '../types/vote.type';
import {Vote} from '../entities/vote.entity';
import {Repository} from 'typeorm';
import {voteRepository} from '../container';
import logger from '../../utils/logger';
import {parseIsoDate} from '../../utils/helpers/date-fns.helper';
import {ProcessSteps} from '../enums/process-steps.enum';
import {sleep} from "../../utils/helpers/sleep.helper";

export class ExtractDownloadedVotesUseCase {
  static #instance: ExtractDownloadedVotesUseCase;

  private readonly inputDir = path.resolve(process.cwd(), 'src/data/scrutins/json');

  private constructor(private readonly voteRepository: Repository<Vote>) {
  }

  public static get instance(): ExtractDownloadedVotesUseCase {
    if (!ExtractDownloadedVotesUseCase.#instance) {
      ExtractDownloadedVotesUseCase.#instance = new ExtractDownloadedVotesUseCase(voteRepository);
    }
    return ExtractDownloadedVotesUseCase.#instance;
  }

  async execute(): Promise<void> {
    await sleep(3000);

    const files = fs.readdirSync(this.inputDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(this.inputDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        await this.processFile(json);

        // Suppression du fichier après succès
        fs.unlinkSync(filePath);
        logger.info(`Fichier supprimé : ${file}`);
      } catch (err) {
        console.error(`Erreur lors du traitement de ${file}:`, err);
      }
    }
  }

  private async processFile(json: VoteType): Promise<void> {
    const uid = json.scrutin.uid;

    const existingVote = await this.voteRepository.findOneBy({uid});

    if (existingVote) {
      logger.info(`Vote with uid ${uid} already exists, skipping insert.`);
      return;
    }

    const extractedAmendments = this.extractAmendmentNumbers(json.scrutin.objet.libelle);

    const vote = new Vote();
    vote.uid = json.scrutin.uid;
    vote.number = Number(json.scrutin.numero);
    vote.applicant = json.scrutin.demandeur.texte ?? '';
    vote.amendments = extractedAmendments;
    vote.subject = json.scrutin.objet.libelle;
    vote.totalVotes = Number(json.scrutin.syntheseVote.suffragesExprimes);
    vote.yesVotes = Number(json.scrutin.syntheseVote.decompte.pour);
    vote.noVotes = Number(json.scrutin.syntheseVote.decompte.contre);
    vote.abstentions = Number(json.scrutin.syntheseVote.decompte.abstentions);
    vote.date = parseIsoDate(json.scrutin.dateScrutin);
    vote.status = ProcessSteps.SAVED_IN_DATABASE;

    const savedVote = await this.voteRepository.save(vote);

    logger.info(`Inserted new vote with number: ${savedVote.number} and ID: ${savedVote.id}`);
  }

  private extractAmendmentNumbers(titre: string): number[] {
    const regex = /amendement n°\s*(\d+)/gi;
    const matches = Array.from(titre.matchAll(regex));
    return matches.map((match) => Number(match[1]));
  }
}
