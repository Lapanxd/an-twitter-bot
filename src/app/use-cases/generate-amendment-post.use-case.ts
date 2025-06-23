import { Repository } from 'typeorm';
import { Vote } from '../entities/vote.entity';
import logger from '../../utils/logger';
import { postRepository, voteRepository } from '../container';
import { capitalizeFirstLetter } from '../../utils/helpers/string.helper';
import { Post } from '../entities/post.entity';

export class GenerateAmendmentPostUseCase {
  static #instance: GenerateAmendmentPostUseCase;

  private constructor(
    private readonly voteRepository: Repository<Vote>,
    private readonly postRepository: Repository<Post>,
  ) {
  }

  static get instance(): GenerateAmendmentPostUseCase {
    if (!GenerateAmendmentPostUseCase.#instance) {
      GenerateAmendmentPostUseCase.#instance = new GenerateAmendmentPostUseCase(
        voteRepository,
        postRepository,
      );
    }
    return GenerateAmendmentPostUseCase.#instance;
  }

  async execute(voteNumber: number): Promise<number> {
    const vote = await this.voteRepository.findOne({ where: { number: voteNumber } });

    if (!vote) {
      logger.error('Vote not found for Number:', voteNumber);
      return;
    }

    const amendmentApproved = vote.yesVotes > vote.noVotes + vote.abstentions ? `ADOPTÉ` : `REJETÉ`;

    const amendmentTitle =
      vote.amendments.length > 0
        ? `Amendement${vote.amendments.length > 1 ? 's' : ''} ${vote.amendments.join(', ')} (${vote.politicalTheme})`
        : capitalizeFirstLetter(vote.subject);

    const amendmentApplicant = vote.applicant;
    const emojiStatus = amendmentApproved === 'ADOPTÉ' ? '✅ ' : '❌ ';

    const themeLine = vote.amendments.length === 0 ? `📂 Thème : ${vote.politicalTheme}\n` : '';

    const consequenceIntro =
      amendmentApproved === 'ADOPTÉ'
        ? 'Ce que ça change :'
        : 'Ce qui était proposé :';

    const lines = [
      `${emojiStatus} ${amendmentApproved} — ${amendmentTitle}`,
      `👤 Proposé par ${amendmentApplicant}`,
    ];

    if (themeLine.trim()) {
      lines.push(themeLine.trim());
    }

    lines.push(
      `📊 Vote : ${vote.yesVotes} pour, ${vote.noVotes} contre, ${vote.abstentions} abstention${vote.abstentions > 1 ? 's' : ''}`,
      '',
      consequenceIntro,
      vote.chatGPTResume?.trim() || '',
    );

    const tweet = lines.join('\n');

    const post = new Post();
    post.text = tweet;
    post.vote = vote;

    const postedPost = await this.postRepository.save(post);

    logger.info(`Post with id : ${postedPost.id} successfully generated for vote #${voteNumber}`);

    return postedPost.id;
  }
}
