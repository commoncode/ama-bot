Feature: Points

   As a slack user, I can record learning and teaching points using the tanabata tree emoji

   Scenario: Learning exchange has happened
    When I've learned something from another person
    And I send a message thanking them
    And the message includes the tanabata tree emoji
    And the message includes the topic taught in the following format: _skill_
    Then a learning point will be recorded for me
    And a teaching point will be recorded for my teachers