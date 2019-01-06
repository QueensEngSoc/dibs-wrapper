import { Component } from 'react';

export default class RadioButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: this.props.children,
      selected: this.props.selected !== null ? this.props.selected : null
    }
  }

  render() {
    const { selected, options } = this.state;

    const renderedOptions = options.map((option, key) => {
      const isCurrent = selected === option.value;

      return (
        <div key={option.value} className={"radio-btn"}>
          <input
            className="radio-btn__radio"
            type="radio"
            name="roomSizes"
            id={option.label}
            value={option.value}
            onChange={this.handleRadio.bind(this)}
          />
          <label className={ isCurrent ? 'radio-btn__radio radio-btn__radio--selected' : 'radio-btn__radio' }>
            {option.label}
          </label>
        </div>
      );
    });
    return (
      <div className="inline-radio">
        {renderedOptions}
      </div>
    )
  }

  handleRadio(e) {
    this.setState({ selected: e.target.value });
    this.props.onChange(e.target.value);
  }
}
