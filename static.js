const LEARNING_KEY = ':tanabata_tree:';
const MAIN_HELP_TEXT = `
This is the AMA bot!  Use it to share learning and collaboration that has occurred.

To record that you learned something, include the tanabata tree emoji (${LEARNING_KEY})
in any message and surround the skill/topic that you learned in underscores.

You can also @mention people in the same message to credit them with teaching you.

Here are a couple examples and their plain-text versions:

> ${LEARNING_KEY} thanks @carol for teaching me about _unit testing_
> \`:tanabata_tree: thanks @carol for teaching me about _unit testing_\`

> @alice @bob taught me _wagtail_! ${LEARNING_KEY}
> \`@alice @bob taught me _wagtail_! :tanabata_tree:\` 

To see a leaderboard of learners and teachers for the past week, type \`/ama leaderboard\` `;

module.exports = { LEARNING_KEY, MAIN_HELP_TEXT };
