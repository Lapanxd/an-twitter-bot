import logger from '../../utils/logger';
import { debateReportRepository } from '../container';
import { Repository } from 'typeorm';
import { DebateReport } from '../entities/debate-report.entity';
import { parseStringPromise } from 'xml2js';
import { parseDateFromFrenchLabel } from '../../utils/helpers/date-fns.helper';
import { Nullable } from '../types/nullable.type';
import { writeFile } from 'node:fs/promises';
import path from 'path';
import fs from 'fs';

export class FetchDebateReportsUseCase {
  static #instance: FetchDebateReportsUseCase;

  private readonly baseUrl = 'https://www.assemblee-nationale.fr/dyn/opendata';
  private readonly filename = 'CRSANR5L17S2025O1N';
  private readonly extension = 'xml';

  private constructor(private readonly debateReportRepository: Repository<DebateReport>) {
  }

  public static get instance(): FetchDebateReportsUseCase {
    if (!FetchDebateReportsUseCase.#instance) {
      FetchDebateReportsUseCase.#instance = new FetchDebateReportsUseCase(debateReportRepository);
    }

    return FetchDebateReportsUseCase.#instance;
  }

  async execute(assemblyId: number): Promise<void> {
    const url = `${this.baseUrl}/${this.filename}${assemblyId}.${this.extension}`;
    const response = await fetch(url);

    if (response.status === 404) {
      throw new Error(`Assembly debate report with id : ${assemblyId} not found.`);
    }

    if (!response.ok) {
      throw new Error(`Error for : ${url}: ${response.statusText}`);
    }

    const xmlContent = await response.text();

    const extractedDateStr = await this.getSeanceDate(xmlContent);

    if (!extractedDateStr) {
      throw new Error(`No date found in the debate report for assembly id: ${assemblyId}`);
    }

    const sessionDate = parseDateFromFrenchLabel(extractedDateStr);

    const debateReport = new DebateReport();
    debateReport.filename = `${this.filename}${assemblyId}.${this.extension}`;
    debateReport.sessionDate = sessionDate;

    await this.debateReportRepository.save(debateReport);

    logger.info(`Debate report with id : ${assemblyId} saved in database successfully.`);

    const dir = path.resolve(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const outputPath = path.join(dir, `CR_${assemblyId}.xml`);
    await writeFile(outputPath, xmlContent, 'utf-8');
  }

  private async getSeanceDate(xml: string): Promise<Nullable<string>> {
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    const cr = parsed['compteRendu'];
    return cr?.metadonnees?.dateSeanceJour || null;
  }
}
