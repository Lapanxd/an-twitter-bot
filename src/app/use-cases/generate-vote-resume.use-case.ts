import logger from '../../utils/logger';
import {openaiClient, voteRepository} from '../container';
import {Repository} from 'typeorm';
import {Vote} from "../entities/vote.entity";
import {PoliticalThemesEnum} from "../enums/political-themes.enum";
import {AmendmentImportance} from "../enums/amendment-importance.enum";

export class GenerateChatGPTVoteResumeUseCase {
  static #instance: GenerateChatGPTVoteResumeUseCase;

  private readonly baseUrl = 'https://www.assemblee-nationale.fr/dyn/opendata';
  private readonly filename = 'AMANR5L17PO838901BTC1522P0D1N';
  private readonly extension = 'json';

  private constructor(private readonly voteRepository: Repository<Vote>) {
  }

  public static get instance(): GenerateChatGPTVoteResumeUseCase {
    if (!GenerateChatGPTVoteResumeUseCase.#instance) {
      GenerateChatGPTVoteResumeUseCase.#instance = new GenerateChatGPTVoteResumeUseCase(voteRepository);
    }

    return GenerateChatGPTVoteResumeUseCase.#instance;
  }

  async execute(voteNumber: number): Promise<void> {
    const vote = await this.voteRepository.findOneBy({number: voteNumber});

    if (!vote) {
      logger.error(`Vote with id : ${voteNumber} not found.`);
      return;
    }

    const completeAmendmentNumber = vote.amendments?.map(amendment => this.formatAmendmentNumber(amendment));

    const amendmentUrls = completeAmendmentNumber?.map(amendment => (`${this.baseUrl}/${this.filename}${amendment}.${this.extension}`))
    
    if (!amendmentUrls?.length) {
      logger.error(`Amendments url not found for vote with id : ${voteNumber}`);
      return;
    }

    const jsonAmendments = await Promise.all(
      amendmentUrls.map(async (amendmentUrl) => {
        const response = await fetch(amendmentUrl);

        if (!response.ok) {
          logger.warn(`${response.status} for ${amendmentUrl}`)
          return null;
        }

        return await response.json();
      })
    );

    for (const amendment of jsonAmendments) {
      logger.info('Generating summary for amendment by chatgpt with uid: ' + amendment.uid);
      const resume = await openaiClient.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en politique et droit français. Pour l'amendement que je te fournirai, explique en une seule phrase concise et compréhensible pour le grand public ce que cela changerait pour les Français. Ne dépasse pas 280 caractères.`
          },
          {role: "user", content: JSON.stringify(amendment, null, 2)}
        ],
        max_completion_tokens: 150,
        n: 1,
        temperature: 0.2,
      });

      vote.chatGPTResume = resume.choices[0].message.content;

      logger.info('Generating political theme for the amendment by chatgpt with uid: ' + amendment.uid);
      const amendmentTheme = await openaiClient.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en politique et droit français.
                      Tu reçois un amendement (objet JSON) ainsi qu'une liste de thèmes politiques possibles sous forme d'enum.
                      Ta tâche est d'analyser le contenu de l'amendement et de retourner **uniquement** le thème **le plus pertinent** de l'enum, sans explication.

                      - Utilise exactement une des **valeurs de l'enum**, pas la clé.
                      - Si plusieurs thèmes semblent correspondre, choisis celui qui est **le plus central** ou **le plus directement concerné**.
                      - Ne réponds qu’avec la **chaîne exacte du thème**, par exemple : "AssuranceMaladie".`
          },
          {
            role: "user", content: JSON.stringify(amendment, null, 2)
          },
          {
            role: "user", content: JSON.stringify(PoliticalThemesEnum)
          }
        ],
        max_completion_tokens: 150,
        n: 1,
        temperature: 0.2,
      });

      const amendmentThemeChosen = amendmentTheme.choices[0].message.content;

      if (Object.keys(PoliticalThemesEnum).includes(amendmentThemeChosen as PoliticalThemesEnum)) {
        vote.politicalTheme = PoliticalThemesEnum[amendmentThemeChosen as keyof typeof PoliticalThemesEnum];
      }

      logger.info('Generating amendment importance for the amendment by chatgpt with uid: ' + amendment.uid);
      const amendmentImportance = await openaiClient.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en politique et droit français.
                      Tu reçois un amendement (objet JSON) ainsi qu'une liste d'importance possibles sous forme d'enum.
                      Ta tâche est d'analyser le contenu de l'amendement et de retourner **uniquement** l'importance **la plus pertinente** de l'enum, sans explication.

                      - Utilise exactement une des **clés de l'enum**, pas la valeur.
                      - Si plusieurs importances semblent correspondre, choisis celle qui est **le plus central**.
                      - Ne réponds qu’avec la **chaîne exacte de l'importance**, par exemple : "MEDIUM".`
          },
          {
            role: "user", content: JSON.stringify(amendment, null, 2)
          },
          {
            role: "user", content: JSON.stringify(AmendmentImportance)
          }
        ],
        max_completion_tokens: 20,
        n: 1,
        temperature: 0.2,
      });

      const amendmentImportanceChosen = amendmentImportance.choices[0].message.content;

      if (Object.keys(AmendmentImportance).includes(amendmentImportanceChosen as AmendmentImportance)) {
        vote.amendmentImportance = AmendmentImportance[amendmentImportanceChosen as keyof typeof AmendmentImportance];
      }

      const savedVote = await this.voteRepository.save(vote);

      logger.info('Vote with id : ' + savedVote.id + ' updated successfully with chatGPT resume and political theme.');
    }
  }

  private formatAmendmentNumber(num: number): string {
    return num.toString().padStart(6, '0');
  }
}
