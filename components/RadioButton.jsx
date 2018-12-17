import { Component } from 'react';

class RadioButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      options: this.props.children,
      selected: this.props.selected || null
    }
  }
  render() {
    const yourPick = this.state.yourPick
    const options = this.state.coffeeTypes.map((loan, key) => {
      const isCurrent = this.state.yourPick === loan
      return (

        <div
          key={key}
          className="radioPad"
        >
          <div>
            <label
              className={
                isCurrent ?
                  'radioPad__wrapper radioPad__wrapper--selected' :
                  'radioPad__wrapper'
              }
            >
              <input
                className="radioPad__radio"
                type="radio"
                name="coffeeTypes"
                id={loan}
                value={loan}
                onChange={this.handleRadio.bind(this)}
              />
              {loan}
            </label>
          </div>
        </div>
      )
    })
    return (
      <div className="container text-center">
        <div className="row">
          <p className="lead">
            <strong>{yourPick}</strong>
            {yourPick ?
              ', nice pick!' : 'Tap away, friend.'
            }
          </p>
          <hr />
          {options}
        </div>
      </div>
    )
  }
  handleRadio(e) {
    this.setState({ yourPick: e.target.value })
  }
}

ReactDOM.render(
  <Radio />,
  document.getElementById('root')
)
