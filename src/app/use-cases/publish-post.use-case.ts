import { TwitterApi } from 'twitter-api-v2';
import { Post } from '../entities/post.entity';
import { Repository } from 'typeorm';
import logger from '../../utils/logger';
import { tweetRepository, twitterClient } from '../container';

export class PublishPostUseCase {
  static #instance: PublishPostUseCase;

  private constructor(
    private readonly client: TwitterApi,
    private readonly tweetRepository: Repository<Post>,
  ) {}

  public static get instance(): PublishPostUseCase {
    if (!PublishPostUseCase.#instance) {
      PublishPostUseCase.#instance = new PublishPostUseCase(twitterClient, tweetRepository);
    }

    return PublishPostUseCase.#instance;
  }

  async execute(postId: number): Promise<void> {
    const post = await tweetRepository.findOne({ where: { id: postId } });

    if (!post) {
      logger.error(`Tweet with id ${postId} not found`);
      return;
    }

    const result = await this.client.v2.tweet(post.text);

    post.posted = true;
    post.tweetId = result.data.id;

    await this.tweetRepository.save(post);

    logger.info(`Tweet with id : ${post.id} posted successfully. Tweet ID: ${post.tweetId}`);
  }
}
