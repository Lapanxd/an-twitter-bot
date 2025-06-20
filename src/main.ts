import {AppDataSource} from './data-source';
import logger from './utils/logger';

// Start cron jobs
import './app/cron'
import {generateChatGptVoteResumeUseCase} from "./app/container";

async function bootstrap() {
  await AppDataSource.initialize();
  logger.info('Database connection established successfully');
  logger.info('App started successfully');

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
  });

  await generateChatGptVoteResumeUseCase.execute(997);

  // await fetchVotesUseCase.execute();
  //
  // await extractDownloadedVotesUseCase.execute();
}

void bootstrap();
