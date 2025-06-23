import logger from '../../utils/logger';
import { openaiClient, voteRepository } from '../container';
import { Repository } from 'typeorm';
import { Vote } from '../entities/vote.entity';
import { PoliticalThemesEnum } from '../enums/political-themes.enum';
import { AmendmentImportance } from '../enums/amendment-importance.enum';

export class GenerateChatGPTVoteResumeUseCase {
  static #instance: GenerateChatGPTVoteResumeUseCase;

  private readonly baseUrl = 'https://www.assemblee-nationale.fr/dyn/opendata';
  private readonly filename = 'AMANR5L17PO838901BTC1522P0D1N';
  private readonly extension = 'json';

  private constructor(private readonly voteRepository: Repository<Vote>) {
  }

  public static get instance(): GenerateChatGPTVoteResumeUseCase {
    if (!GenerateChatGPTVoteResumeUseCase.#instance) {
      GenerateChatGPTVoteResumeUseCase.#instance = new GenerateChatGPTVoteResumeUseCase(
        voteRepository,
      );
    }

    return GenerateChatGPTVoteResumeUseCase.#instance;
  }

  async execute(voteNumber: number): Promise<Vote> {
    const vote = await this.voteRepository.findOneBy({ number: voteNumber });

    if (!vote) {
      logger.error(`Vote with id : ${voteNumber} not found.`);
      return;
    }

    if (vote.chatGPTResume && vote.politicalTheme && vote.amendmentImportance && vote.amendments.length === 1) {
      logger.info('Vote with id : ' + voteNumber + ' already has a chatGPT resume and political theme.');
      return;
    }

    const completeAmendmentNumber = vote.amendments?.map((amendment) =>
      this.formatAmendmentNumber(amendment),
    );

    const amendmentUrls = completeAmendmentNumber?.map(
      (amendment) => `${this.baseUrl}/${this.filename}${amendment}.${this.extension}`,
    );

    if (!amendmentUrls?.length) {
      logger.error(`Amendments url not found for vote with id : ${voteNumber}`);
      return;
    }

    const jsonAmendments = await Promise.all(
      amendmentUrls.map(async (amendmentUrl) => {
        const response = await fetch(amendmentUrl);

        if (!response.ok) {
          logger.warn(`${response.status} for ${amendmentUrl}`);
          return null;
        }

        return await response.json();
      }),
    );

    for (const amendment of jsonAmendments) {
      logger.info('Generating summary for amendment by chatgpt with uid: ' + amendment.uid);
      const resume = await openaiClient.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en politique et droit français. Pour l'amendement que je te fournirai, résume les conséquences concrètes en 1 à 3 points clairs, compréhensibles par le grand public. 
Commence chaque point par un émoji différent pertinent, suivi du texte. Ne dépasse pas 280 caractères au total.`,
          },
          { role: 'user', content: JSON.stringify(amendment, null, 2) },
        ],
        max_completion_tokens: 150,
        n: 1,
        temperature: 0.2,
      });

      if (vote.chatGPTResume && vote.amendments.length > 1) {
        vote.chatGPTResume += '\n' + resume.choices[0].message.content;
      }

      if (!vote.chatGPTResume) {
        vote.chatGPTResume = resume.choices[0].message.content;
      }
    }

    logger.info(
      'Generating political theme for the amendment by chatgpt for vote vote with id : ' + vote.id,
    );

    const amendmentThemeChosen = await this.generateAmendmentTheme(jsonAmendments);

    if (!amendmentThemeChosen) {
      logger.warn(`No theme generated for vote with id : ${voteNumber}`);
      return;
    }

    if (Object.keys(PoliticalThemesEnum).includes(amendmentThemeChosen as PoliticalThemesEnum)) {
      vote.politicalTheme =
        PoliticalThemesEnum[amendmentThemeChosen as keyof typeof PoliticalThemesEnum];
    }

    logger.info(
      'Generating importance for the amendment by chatgpt for vote vote with id : ' + vote.id,
    );

    const amendmentImportanceChosen = await this.generatedAmendmentImportance(jsonAmendments);

    if (!amendmentImportanceChosen) {
      logger.warn(`No importance generated for vote with id : ${voteNumber}`);
      return;
    }

    if (
      Object.keys(AmendmentImportance).includes(amendmentImportanceChosen as AmendmentImportance)
    ) {
      vote.amendmentImportance =
        AmendmentImportance[amendmentImportanceChosen as unknown as keyof typeof AmendmentImportance];
    }

    const savedVote = await this.voteRepository.save(vote);

    logger.info(
      'Vote with id : ' +
      savedVote.id +
      ' updated successfully with chatGPT resume, political theme and importance.',
    );

    return savedVote;
  }

  private async generateAmendmentTheme(jsonAmendments: any[]): Promise<PoliticalThemesEnum> {
    const amendmentThemeGenerated = await openaiClient.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en politique et droit français.
                      Tu reçois un array de json d'amendements ainsi qu'une liste de thèmes politiques possibles sous forme d'enum.
                      Ta tâche est d'analyser le contenu des amendements et de retourner **uniquement** le thème **le plus pertinent** de l'enum, sans explication.

                      - Utilise exactement une des **clé de l'enum**, pas la valeur.
                      - Si plusieurs thèmes semblent correspondre, choisis celui qui est **le plus central** ou **le plus directement concerné**.
                      - Ne réponds qu’avec la **chaîne exacte du thème**, par exemple : "AssuranceMaladie".`,
        },
        {
          role: 'user',
          content: JSON.stringify(jsonAmendments, null, 2),
        },
        {
          role: 'user',
          content: JSON.stringify(PoliticalThemesEnum),
        },
      ],
      max_completion_tokens: 150,
      n: 1,
      temperature: 0.2,
    });

    return amendmentThemeGenerated.choices[0].message.content as PoliticalThemesEnum;
  }

  private async generatedAmendmentImportance(jsonAmendments: any[]): Promise<AmendmentImportance> {
    const amendmentImportance = await openaiClient.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en politique et droit français.
                      Tu reçois un array de json d'amendements ainsi qu'une liste d'importance possibles sous forme d'enum.
                      Ta tâche est d'analyser le contenu des amendements et de retourner **uniquement** l'importance **la plus pertinente** de l'enum, sans explication.

                      - Utilise exactement une des **clés de l'enum**, pas la valeur.
                      - Si plusieurs importances semblent correspondre, choisis celle qui est **le plus central**.
                      - Ne réponds qu’avec la **chaîne exacte de l'importance**, par exemple : "MEDIUM".`,
        },
        {
          role: 'user',
          content: JSON.stringify(jsonAmendments, null, 2),
        },
        {
          role: 'user',
          content: JSON.stringify(AmendmentImportance),
        },
      ],
      max_completion_tokens: 20,
      n: 1,
      temperature: 0.2,
    });

    return amendmentImportance.choices[0].message.content as AmendmentImportance;
  }

  private formatAmendmentNumber(num: number): string {
    return num.toString().padStart(6, '0');
  }
}
