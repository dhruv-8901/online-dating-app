import cron from "node-cron";
import completeDate from "./completeDate";
import removeMatches from "./removeMatches";
import removeMatchesIfNoActionAfterDateCancelled from "./removeMatchesAfterCancelDate";

cron.schedule("0 0 * * *", () => {
  console.log(`Cron job is running at ${new Date()}`);
  completeDate();
  removeMatches();
  removeMatchesIfNoActionAfterDateCancelled();
});

export default cron;
