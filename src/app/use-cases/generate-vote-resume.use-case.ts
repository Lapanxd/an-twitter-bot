import logger from '../../utils/logger';
import {openaiClient, voteRepository} from '../container';
import {Repository} from 'typeorm';
import {Vote} from "../entities/vote.entity";

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

    if (!amendmentUrls) {
      logger.error(`Amendments url not found for vote with id : ${voteNumber}`);
      return;
    }

    const jsonAmendments = await Promise.all(
      amendmentUrls.map(async (amendmentUrl) => {
        const response = await fetch(amendmentUrl);
        return response.json();
      })
    );

    for (const amendment of jsonAmendments) {
      logger.info('Generating summary for amendment by chatgpt with uid: ' + amendment.uid);
      const completion = await openaiClient.chat.completions.create({
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

      vote.chatGPTResume = completion.choices[0].message.content;

      await this.voteRepository.save(vote);
    }
  }

  private formatAmendmentNumber(num: number): string {
    return num.toString().padStart(6, '0');
  }
}
