# Vitaliy Zakharov FE Code Test
## Running
This is a standard react application
1. Install packages `npm install`
2. Start development server `npm run start`
3. Applicaiton available at `http://localhost:3000/`

## Summary
This is implemented as a basic typescript React application. Architecturally
I separated pure presentational components from the one handling the state. Additionally,
I have started building out a library of types functions to deal with particular strcutures
pertinent to this application.

## Operation
This application fetches the questions from the backend and then renders them according to
the quesiton type. This should allow backend to send as many questions as needed.
User is giving basic provision to step back to previous questions. The backend data
also allows pre selected values for questions. Overall, given the time constraints,
I biased towards a code that shows the key patterns and allows space to organically grow to solve future
needs. I take advantage of fp-ts library as a decent TS standard library to deal with common
nullability issues and data structure manipulation.

## Out of scope
1. Given the syntetic nature of the backend, we do not currently submit any data, but i would be trivial to add that
2. Error handling is not implemented, but the structure will allow to easily add it. The state describing current question can also keep trck of validation/errors
3. UX components can be refactored to avoid repetition
4. Separating code into multiple files.