# My Solution

## Context

A fitness club/society with one admin member who is in charge, and ordinary members
who can sign up. The website is used to compose, store and distribute workouts and
track member activity (with regards to performing the workouts).

The admin will have their own section of the site where they can perform their specific
tasks.

## Admin functions

- View members of the club and various club/member statistics.
- Set a daily workout for members to view.
- Manage workouts:
  - Add exercises
  - (Approve member created exercises) OPTIONAL
  - Add workouts as a sequence of exercises
  - View user ratings of workouts and exercises:
    - Difficulty
    - Enjoyment
    - Effectiveness
    - (Type (full-body, legs, shoulders etc.)) OPTIONAL

## Ordinary member functions

- View all workouts (with sorting and filtering too)
- Rate workouts on the criteria mentioned above
- Mark workouts as done
- (Add workouts from existing exercises) OPTIONAL
- (Add exercises (must be approved by admin)) OPTIONAL
- (View/edit profile with stats) OPTIONAL

## User representation

Fields:

- Username
- Forename
- Surname
- Password (hashed)

## Exercise representation

Fields:

- Name
- Slug (unique)
- Description
- Difficulty (out of 5)
- (Tags (referring to muscle groups the exercise uses)) OPTIONAL

## Workout representation

Basic components:

- Description
- Sets of:
  - Individual exercises (with reps/time) and rests
  - Sequences of exercises and rests
- User ratings of various metrics

The workout (the exercise component) will be encoded using the following scheme:

...

## Initial data

There will have to be a good amount of initial data to demo the website.

- Admin user
- Member user (Delia Derbyshire, with password __DAnnD37__)
- ~5 workouts + exercises (to demo filtering and use of workouts)