import React from 'react';
import './Form.css';
import shuffle from '../../utilities/shuffle';
import inputCheck from '../../utilities/inputCheck';
import generateId from '../../utilities/generateId';
import QuestionTypes from '../QuestionTypes/QuestionTypes';
import EnterYourQuestion from '../EnterYourQuestion/EnterYourQuestion';
import RowOptions from '../RowOptions/RowOptions';
import ColumnOptions from '../ColumnOptions/ColumnOptions';
import CheckBox from '../CheckBox/CheckBox';
import OptionsBlock from '../OptionsBlock/OptionsBlock';


let handleDeleteSequence;

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: generateId(),
      text: '',
      type: "RADIO_GRID",
      media: {
        id: generateId(),
        url: '',
        file_name: '',
        content_type: ''
      },
      options: {
        row: [
          {
            id: generateId(),
            text: '',
            sequence: 1
          }
        ],
        column: [
          {
            id: generateId(),
            text: '',
            sequence: 1
          }
        ]
      },
      sequence: 1,
      randomize: false,
      include_other: false
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLayout = this.handleLayout.bind(this);
    this.handleQuestionDelete = this.handleQuestionDelete.bind(this);
    this.onQuestionChange = this.onQuestionChange.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.deleteOption = this.deleteOption.bind(this);
    this.addOption = this.addOption.bind(this);
    this.resetState = this.resetState.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { viewQuestion } = this.props;
    if (!viewQuestion) return;

    if (viewQuestion !== prevProps.viewQuestion) {
      this.setState({
        ...viewQuestion
      })
    }
  }

  handleInputChange(index, e) {
    const { name, value } = e.target;
    const items = [...this.state.options[name]];
    items[index].text = value;
    let opposite;
    let oppositeName;

    if (name === 'row') {
      opposite = [...this.state.options.column]
      oppositeName = 'column';
    } else {
      opposite = [...this.state.options.row]
      oppositeName = 'row';
    }

    this.setState(prevState => ({
      ...prevState,
      options: {
        ...prevState.options,
        [name]: items,
        [oppositeName]: opposite
      }
    }));
  }

  handleToggle(e) {
    const { name } = e.target;
    const isChecked = !this.state[name];
    this.setState(prevState => ({
        ...prevState,
        [name]: isChecked
    }));
  }

  handleSubmit(e) {
    e.preventDefault();
    const { text, type, options, randomize } = this.state;
    const { row, column } = options; 
    const check = inputCheck(text, type, row, column);

    if (!check) {
      return;
    }

    const changedState = {...this.state};

    if (randomize) {
      let rowsArray = [...row];
      rowsArray = shuffle(rowsArray)
      for (let i = 0; i < rowsArray.length; i++) {
        rowsArray[i].sequence = i+1;
      }
      changedState.options.row = rowsArray;
    }

    this.props.addQuestion(changedState);
    this.resetState();
  }

  handleLayout(e) {
    this.setState(prevState => ({
      ...prevState,
      type: e.target.value
    }));
  }

  handleQuestionDelete(sequence) {
    handleDeleteSequence = sequence;
    this.resetState(handleDeleteSequence);
  }

  onQuestionChange(e) {
    const { value } = e.target;
    this.setState(prevState => ({
        ...prevState,
        text: value
    }));
  }

  onFileChange(e) {
    const file = e.target.files[0];
    const question = {...this.state};

    if (file !== undefined) {
      question.media = {
        id: generateId(),
// check lastModified error
        url: file.lastModified,
        file_name: file.name,
        content_type: file.type,
      }

      this.setState({
        media: question
      })
    }
  }

  deleteOption(index, e) {
    const { options } = this.state;
    const { name } = e.target;
    
    if (options[name].length === 1) return;

    const optionsArray = [...options[name]];
    optionsArray.splice(index, 1);
    let opposite;
    let oppositeName;

    for (let i = 0; i < optionsArray.length; i++) {
      optionsArray[i].sequence = i + 1;
    }

    if (name === 'row') {
      opposite = [...this.state.options.column];
      oppositeName = 'column';
    } else {
      opposite = [...this.state.options.row];
      oppositeName = 'row';
    }

    this.setState(prevState => ({
      ...prevState,
        options: {
          ...prevState.options,
          [name]: optionsArray,
          [oppositeName]: opposite
        }
    }));
  }

  addOption(e) {
    const { name } = e.target;
    const options = [...this.state.options[name]];
    const sequence = this.state.options[name].length + 1;
    options.push({
      "id": generateId(),
      "text": '',
      "sequence": sequence,
    });

    this.setState(prevState => ({
      ...prevState,
      options: {
        ...prevState.options,
        [name]: options
      }
    }))
  }

  resetState(sequence) {
    this.setState({
      id: generateId(),
      text: '',
      type: "RADIO_GRID",
      media: {
        id: generateId(),
        url: '',
        file_name: '',
        content_type: ''
      },
      options: {
        row: [
          {
            id: generateId(),
            text: '',
            sequence: 1
          }
        ],
        column: [
          {
            id: generateId(),
            text: '',
            sequence: 1
          }
        ]
      },
      sequence: 1,
      randomize: false,
      include_other: false
    }, () => {
      if (sequence) {
        this.props.handleDelete(handleDeleteSequence);
      }
    })
  }

  render() {
    let disableButton = false;

    if (this.props.questionsLength === this.props.maxQuestions) {
      disableButton = true;
    }

    const column = () => {
      if (this.state.type === "RADIO_GRID" || this.state.type === "CHECK_BOX_GRID") {
        return (
          <OptionsBlock
            title="Column Options"
            position="column"
            positionOptions={this.state.options.column}
            handleInputChange={this.handleInputChange}
            addOption={this.addOption}
            deleteOption={this.deleteOption}
          />
        );
      } 
        return null;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="HeaderBar">
          {/* <div>...</div> */}
          <div className="LayoutSelectorWrapper">
            <select
              className="LayoutSelector"
              value={this.state.type}
              onChange={this.handleLayout}
            >
              {this.props.questionTypes.map(option => <QuestionTypes key={option} option={option} />)}
            </select>
          </div>
          <div className="VerticleDivider" />
          <div className="EditOptionWrapper">
            <button type="button" onClick={() => this.handleQuestionDelete(this.state.sequence)}>Delete Question</button>
          </div>
        </div>
        <EnterYourQuestion 
          value={this.state.text}
          onQuestionChange={this.onQuestionChange}
          onFileChange={this.onFileChange}
        />
        <OptionsBlock
          title="Row Options"
          position="row"
          positionOptions={this.state.options.row}
          handleInputChange={this.handleInputChange}
          addOption={this.addOption}
          deleteOption={this.deleteOption}
        />
        <CheckBox
          name="include_other"
          checked={this.state.includeOther}
          handleToggle={this.handleToggle}
          label="Allow multiple responses per row"
        />
        <CheckBox
          name="randomize"
          checked={this.state.randomize}
          handleToggle={this.handleToggle}
          label="Randomize Rows"
        />
        {/* ANSWER FOR COLUMN IF GRID LAYOUT SELECTED */}
        {column()}
        {/* BUTTON TO SAVE THE QUESTION FORM */}
        <input type="submit" disabled={disableButton} value="+ Add Question" />
      </form>
    );
  }
}

export default Form;
