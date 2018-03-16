import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ImageClip from '../../src/index';

class Demo extends React.Component<any, any> {
  render() {
    return (
      <ImageClip
        src="./demo.jpeg"
      />
    );
  }
}

ReactDOM.render(<Demo />, document.querySelector('#react-content'))
