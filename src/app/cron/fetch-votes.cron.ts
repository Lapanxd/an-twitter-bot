import cron from "node-cron";
import {extractDownloadedVotesUseCase, fetchVotesUseCase} from "../container";

cron.schedule('30 9,13,17 * * *', async () => {
  await fetchVotesUseCase.execute();
  await extractDownloadedVotesUseCase.execute();
});

