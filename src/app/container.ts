import {TwitterApi} from 'twitter-api-v2';
import {AppDataSource} from '../data-source';
import {Post} from './entities/post.entity';
import {PublishPostUseCase} from './use-cases/publish-post.use-case';
import * as dotenv from 'dotenv';
import {DebateReport} from './entities/debate-report.entity';
import {FetchVotesUseCase} from './use-cases/fetch-votes.use-case';
import {Vote} from './entities/vote.entity';
import {ExtractDownloadedVotesUseCase} from './use-cases/extract-downloaded-votes.use-case';
import {GenerateChatGPTVoteResumeUseCase} from "./use-cases/generate-vote-resume.use-case";
import {OpenAI} from "openai";

dotenv.config();

// Twitter API Client
export const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY!,
  appSecret: process.env.TWITTER_APP_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

export const openaiClient = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY!,
});

// TypeORM Repositories
export const tweetRepository = AppDataSource.getRepository(Post);
export const debateReportRepository = AppDataSource.getRepository(DebateReport);
export const voteRepository = AppDataSource.getRepository(Vote);

// Use Cases
export const postTweetUseCase = PublishPostUseCase.instance;
export const fetchVotesUseCase = FetchVotesUseCase.instance;
export const extractDownloadedVotesUseCase = ExtractDownloadedVotesUseCase.instance;
export const generateChatGptVoteResumeUseCase = GenerateChatGPTVoteResumeUseCase.instance;
