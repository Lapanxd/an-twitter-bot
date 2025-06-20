import {AppDataSource} from './data-source';
import logger from './utils/logger';
import {generateChatGptVoteResumeUseCase} from './app/container';

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

  await generateChatGptVoteResumeUseCase.execute(2631);
}

void bootstrap();
