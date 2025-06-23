import { AppDataSource } from './data-source';
import logger from './utils/logger';

// Start cron jobs
import './app/cron';
import { startServer } from './app/http-server';

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

  // await fetchVotesUseCase.execute();
  // await extractDownloadedVotesUseCase.execute();

  // const votes = await getVotesToPost();
  //
  // for (const vote of votes) {
  //   // await generateChatGptVoteResumeUseCase.execute(vote.number);
  //   await generateAmendmentPostUseCase.execute(vote.number);
  // }

  // await generateChatGptVoteResumeUseCase.execute(2470);
  // await generateAmendmentPostUseCase.execute(2470);

  startServer().catch((err) => {
  });
}

void bootstrap();
