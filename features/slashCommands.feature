Feature: Slash commands

   As a slack user, I can use slash commands to view the leaderboard and get help on how to use the AMA bot

   Scenario: User can view leaderboard
    When I type "\\ama leaderboard"
    Then AMA bot will reply with the top three teachers and learners

   Scenario: User can get help text
    When I type "\\ama help"
    When AMA bot will reply with usage instructions
     