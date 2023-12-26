import React from 'react';
import './App.css';
import * as O from "fp-ts/Option"
import * as A from "fp-ts/Array"
import * as b from "fp-ts/boolean"
import {pipe} from "fp-ts/function";

type FormQuestion = TextQuestion | SingleChoice | MultipleChoice

type TextQuestion = {
    _type: "text",
    defaultText: string
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
    selected?: number
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
        defaultText: "",
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
        description: "What is your insurance status",
        choices: [{text: "Yes, I'm Insured"}, {text: "No, I do not have insurance"}],
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
        selected: [1, 2]
    }
}

export const mockEndpoint = (req: ServerRequest): Promise<ServerResponse> => {
    if (!req.questionId) return Promise.resolve({step: sampleTextStep})
    if (req.questionId === "step1") return Promise.resolve({step: sampleSingleChoiceStep})
    if (req.questionId === "step2") return Promise.resolve({step: sampleMultipleChoiceStep})
    if (req.questionId === "step3") return Promise.resolve({step: {_type: "final"}})

    throw new Error("Invalid Server Request")
}


type Questions = Array<QuestionStep>


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

const addQuestion = (id: string, question: FormQuestion) => (questions: Questions) => pipe(questions, A.exists(ById(id)), b.fold(() => questions.concat([{
    _type: "question",
    id,
    question
}]), () => questions))

const getPrevious = (id: string) => (questions: Questions) => pipe(questions, A.findIndex(ById(id)), O.chain(index => pipe(questions, A.lookup(index - 1))))

const ById = (id: string) => (step: QuestionStep) => step.id === id

const getQuestion = (id: string) => (questions: Questions) => pipe(questions, A.findFirst(ById(id)))

const Question: React.FC<{ question: FormQuestion, onDone: () => void }> = props => {
    switch (props.question._type) {
        case "text":
            return <TextQuestion question={props.question} onDone={props.onDone}/>
        case "single":
            return <SingleChoiceQuestion question={props.question} onDone={props.onDone}/>
        case "multiple":
            return <MultipleChoiceQuestion question={props.question} onDone={props.onDone}/>
    }
    return null
}

const Done: React.FC<{}> = props => {
    return <div className="min-h-screen flex flex-col justify-between">
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto p-6">
            <div className="text-center">
                <h1 className={"text-4xl font-bold"}>We are On it</h1>
                <p className={"mt-4"}>Sorry to hear you are having an issue with your bill</p>
            </div>
        </div>

    </div>
}
const Welcome: React.FC<{ onReady: () => void }> = (props) =>
    <div className="min-h-screen flex flex-col justify-between">
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto p-6">
            <div className="text-center">
                <h1 className={"text-4xl font-bold"}>Hey There!</h1>
                <p className={"mt-4"}>Sorry to hear you are having an issue with your bill</p>
            </div>
        </div>
        <div className="bg-gray-100 shadow-md p-4">
            <button
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800"
                type="button"
                onClick={() => props.onReady()}
            >
                Start
            </button>
        </div>
    </div>
const QuestionStep: React.FC<{ children: React.ReactNode, onPrev: () => void }> = (props) =>
    <div className="min-h-screen flex flex-col justify-between">
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto p-6">
            {props.children}
        </div>
        <div className="bg-gray-100 shadow-md p-4">
            <a
                href="#"
                className="text-black hover:underline focus:outline-none focus:shadow-outline-gray"
                onClick={(e) => {
                    e.preventDefault();
                    props.onPrev();
                }}
            >
                Previous Question
            </a>
        </div>
    </div>


const TextQuestion: React.FC<{ question: TextQuestion, onDone: () => void }> = ({
                                                                                    question: {
                                                                                        question,
                                                                                        description,
                                                                                        defaultText
                                                                                    }, onDone
                                                                                }) => {
    return (
        <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-4">{question}</h2>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="mb-4">
                <input
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
                    type="text"
                    placeholder={defaultText}
                />
            </div>

            <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800"
                type="button"
                onClick={() => onDone()}
            >
                Ok!
            </button>
        </div>
    )
}

const SingleChoiceQuestion: React.FC<{ question: SingleChoice, onDone: () => void }> = ({
                                                                                            onDone,
                                                                                            question: {
                                                                                                question,
                                                                                                description,
                                                                                                choices,
                                                                                                selected
                                                                                            }
                                                                                        }) => {
    return (
        <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-4">{question}</h2>
            <p className="text-gray-600 mb-4">{description}</p>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Select One</label>
                <div className="flex flex-col">
                    {choices.map((choice, i) => <label className="inline-flex items-center" key={i}>
                        <input type="radio" name="choice" className="form-radio text-indigo-500"
                               defaultChecked={selected === i}/>
                        <span className="ml-2">{choice.text}</span>
                    </label>)}
                </div>
            </div>

            <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800"
                type="button"
                onClick={onDone}
            >
                Ok!
            </button>
        </div>
    );
};
const MultipleChoiceQuestion: React.FC<{ question: MultipleChoice, onDone: () => void }> = ({
                                                                                                onDone,
                                                                                                question: {
                                                                                                    question,
                                                                                                    description,
                                                                                                    choices,
                                                                                                    selected
                                                                                                }
                                                                                            }) => {
    return (
        <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-4">{question}</h2>
            <p className="text-gray-600 mb-4">{description}</p>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Choose as many as you like</label>
                <div className="flex flex-col">
                    {choices.map((choice, i) => <label className="inline-flex items-center" key={i}>
                        <input type="checkbox" className="form-checkbox text-indigo-500"
                               defaultChecked={selected.includes(i)}/>
                        <span className="ml-2">{choice.text}</span>
                    </label>)}
                </div>
            </div>


            <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline-green active:bg-green-800"
                type="button"
                onClick={onDone}
            >
                Ok!
            </button>
        </div>
    );
};


export const FormController = () => {
    const [questions, setQuestions] = React.useState<Questions>([]);
    const [formState, setFormState] = React.useState<FormState>(welcomeForm)


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

    const handleBack = (id: string) => {
        pipe(questions, getPrevious(id), O.foldW(() => {
        }, (prev) => {
            setFormState({_type: "active", id: prev.id})
        }))
    }

    switch (formState._type) {
        case "welcome":
            return <Welcome onReady={handleStart}/>
        case "active":
            return pipe(questions, getQuestion(formState.id), O.map(step => <QuestionStep
                onPrev={() => handleBack(formState.id)}><Question
                question={step.question}
                onDone={() => queryServer({questionId: formState.id}).then(processResponse(handleAddQuestion, handleFormDone))}/></QuestionStep>), O.toNullable)
        case "done":
            return <Done/>
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
