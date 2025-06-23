import cron from 'node-cron';
import {
  generateAmendmentPostUseCase,
  generateChatGptVoteResumeUseCase,
  publishPostUseCase,
  voteRepository,
} from '../container';
import { ProcessSteps } from '../enums/process-steps.enum';
import { Vote } from '../entities/vote.entity';
import logger from '../../utils/logger';
import { AmendmentImportance } from '../enums/amendment-importance.enum';

let lastExec = 0;

cron.schedule('*/10 9-10,13,17-23 * * *', async () => {
  const now = Date.now();

  // mêmes filtres horaires

  const h = new Date(now).getHours();
  const m = new Date(now).getMinutes();

  if (h === 9 && m < 30) return;
  if (h === 10 && m > 30) return;

  if (h === 13 && m < 30) return;
  if (h === 14 && m > 0) return;

  if (h === 17 && m < 30) return;
  if (h === 23 && m > 30) return;

  // vérifier le temps écoulé depuis dernière exécution
  if (now - lastExec < 20 * 60 * 1000) return; // au moins 20 min

  // si plus de 40 min, on force l’exécution
  if (now - lastExec > 40 * 60 * 1000) {
    lastExec = now;
    await processVotesToPost();
    return;
  }

  // entre 20 et 40 min, on peut décider d'exécuter aléatoirement
  if (Math.random() < 0.5) {
    lastExec = now;
    await processVotesToPost();
  }
});

async function processVotesToPost() {
  const votes = await getVotesToPost();

  const sortedVotes = votes.sort((a, b) => a.number - b.number);

  if (sortedVotes.length === 0) {
    logger.warn('No votes found');
    return;
  }

  await publishVotePost(sortedVotes[0]);
}

export async function getVotesToPost(): Promise<Vote[]> {
  return await voteRepository.find({ where: { status: ProcessSteps.SAVED_IN_DATABASE } });
}

async function publishVotePost(vote: Vote): Promise<void> {
  const generatedVote = await generateChatGptVoteResumeUseCase.execute(vote.number);
  const createdPostId = await generateAmendmentPostUseCase.execute(vote.number);

  if (generatedVote.amendmentImportance === AmendmentImportance.HIGH ||
    generatedVote.amendmentImportance === AmendmentImportance.VERY_HIGH ||
    generatedVote.amendmentImportance === AmendmentImportance.CRITICAL ||
    generatedVote.amendmentImportance === AmendmentImportance.BLOCKER
  ) {
    await publishPostUseCase.execute(createdPostId);
    logger.info('Published post:', createdPostId);
  }
}

