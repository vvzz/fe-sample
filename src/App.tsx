import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import * as O from "fp-ts/Option"
import * as M from "fp-ts/Map"
import * as s from "fp-ts/string"
import {pipe} from "fp-ts/function";

type FormQuestion = TextQuestion | SingleChoice | MultipleChoice

type TextQuestion = {
    _type: "text",
    default: O.Option<string>
} & Meta


type Id = {
    id: string;
}
type Meta = {
    question: string;
    description: string;
}

type Choices = {
    choices: Array<{ text: string }>
}

type SingleChoice = {
    _type: "single",
    selected: O.Option<number>
} & Choices & Meta

type MultipleChoice = {
    _type: "multiple"
    selected: Array<number>
} & Choices & Meta


type QuestionStep = {
    _type: "question",
    question: FormQuestion
} & Id
type FinalStep = {
    _type: "final",
}

type Step = QuestionStep | FinalStep

type ServerResponse = {
    step: Step
}

type ServerRequest = {
    questionId?: string;
    value?: string | Array<string>
}

const sampleTextStep: Step = {
    _type: "question",
    id: "step1",
    question: {
        _type: "text",
        default: O.none,
        question: "What is your last name",
        description: "Provide your legal last name",

    }
}

const sampleSingleChoiceStep: Step = {
    _type: "question",
    id: "step2",
    question: {
        _type: "single",
        question: "Are you insured?",
        description: "What is your insruance status",
        choices: [{text: "Yes"}, {text: "No"}],
        selected: O.none
    }
}

const sampleMultipleChoiceStep: Step = {
    _type: "question",
    id: "step3",
    question: {
        _type: "multiple",
        question: "What is the issue",
        description: "What is the problem with your claim(select all that apply)",
        choices: [{text: "Incorrect Charge"}, {text: "Charged Too Much"}, {text: "Incorrect Information"}],
        selected: []
    }
}

export const mockEndpoint = (req: ServerRequest): Promise<ServerResponse> => {
    if (!req.questionId) return Promise.resolve({step: sampleTextStep})
    if (req.questionId === "step1") return Promise.resolve({step: sampleSingleChoiceStep})
    if (req.questionId === "step2") return Promise.resolve({step: sampleMultipleChoiceStep})

    throw new Error("Invalid Server Request")
}


type Questions = Map<string, FormQuestion>;


type WelcomeState = { _type: "welcome" }
type ActiveQuestion = { _type: "active" } & Id
type DoneState = { _type: "done" }
type FormState = WelcomeState | ActiveQuestion | DoneState

const welcomeForm: FormState = {
    _type: "welcome"
}

const queryServer = (req: ServerRequest) => mockEndpoint(req)

const processResponse = (onQuestion: (id: string, question: FormQuestion) => void, onFinal: () => void) => (res: ServerResponse) => {
    if (res.step._type === "question") {
        onQuestion(res.step.id, res.step.question)
    } else if (res.step._type === "final") {
        onFinal()
    }
}

const addQuestion = (id: string, question: FormQuestion) => (questions: Questions) => pipe(questions, M.upsertAt(s.Eq)(id, question))

const getQuestion = (id: string) => (questions: Questions) => pipe(questions, M.lookup(s.Eq)(id))

const Question: React.FC<{ question: FormQuestion }> = props => {
    return <div>you</div>
}

const Done: React.FC<{}> = props => {
    return <div>Done</div>
}
const Welcome: React.FC<{ onReady: () => void }> = (props) => <div>
    <div><h1>Hey There!</h1>
        <p>Sorry to hear you are having an issue with your bill</p></div>
    <div>
        <button className="py-2 px-4 rounded" onClick={() => props.onReady}>
            Start
        </button>
    </div>
</div>

export const FormController = () => {
    const [questions, setQuestions] = React.useState<Questions>(new Map());
    const [formState, setFormState] = React.useState<FormState>(welcomeForm)


    useEffect(() => {
    }, [])

    const handleAddQuestion = (id: string, question: FormQuestion) => {
        setQuestions(addQuestion(id, question))
        setFormState({_type: "active", id})
    }

    const handleFormDone = () => {
        setFormState({_type: "done"})
    }


    const handleStart = () => {
        queryServer({}).then(processResponse(handleAddQuestion, handleFormDone))
    }

    switch (formState._type) {
        case "welcome":
            return <Welcome onReady={handleStart}/>
        case "active":
            return pipe(questions, getQuestion(formState.id), O.map(quesiton => <Question
                question={quesiton}/>), O.toNullable)
        case "done":
            <Done/>
    }
    return null;

}


function App() {
    return (
        <div className="App">
            <FormController/>
        </div>
    );
}

export default App;
