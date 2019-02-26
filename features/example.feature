Feature: example feature name 

  Background:
    Given this feature has a background 
      And this background applies to more than one scenario

    
    Scenario: first example scenario name
      When we do something for the first scenario
        And there is a another "when" step
      Then we expect to see this outcome
        And this outsome as well
        And this outcome
      
      When we do another thing
      Then we expect this outcome

    Scenario: second example scenario name
      When we do this
        And this
        And that
      Then this will happen
        And this
        And that
