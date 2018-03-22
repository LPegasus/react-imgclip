import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ImageClip from '../../src/index';
import '../../src/index.less';

class Demo extends React.Component<any, any> {
  getImageData: (opts: any) => Promise<string | Blob>;
  state = {
    ratio: "1",
    posInfo: {} as any,
    canOverClip: false,
  };

  handleChange = info => {
    console.log(info);
    this.setState({
      posInfo: info,
    });
  };

  handleOverClip = e => {
    this.setState({
      canOverClip: e.target.checked,
    });
  }

  handleSelect = e => {
    this.setState({
      ratio: e.target.value,
    });
  };

  handleMoveToLeftTop = () => {
    this.setState(s => {
      s.posInfo = { ...s.posInfo, x: 0, y: 0 };
      return s;
    });
  };

  showClippedImage = async () => {
    const stream = await this.getImageData({ exportType: 'blob' });
    console.log(stream);
  }

  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <ul>
          <li>
            <div style={{ width: '30%' }}>ratio</div>
            <div style={{ width: '70%' }}>
              <select style={{ padding: 4 }} onChange={this.handleSelect} value={this.state.ratio}>
                <option value="">不限制</option>
                <option value="0.5">1 : 2</option>
                <option value="1">1 : 1</option>
                <option value="4 / 3">4 : 3</option>
                <option value="16 / 9">16 : 9</option>
                <option value="21 / 9">21 : 9</option>
              </select>
            </div>
          </li>
          <li style={{ height: '2rem' }}>
            <div style={{ width: '30%' }}>control</div><button onClick={this.handleMoveToLeftTop}>move to (0, 0)</button>
          </li>
          <li>
            <div style={{ width: '50%' }}>can over clip</div>
            <input type="checkbox" checked={this.state.canOverClip} onChange={this.handleOverClip} />
          </li>
        </ul>
        <div style={{ width: '90vw', marginTop: '1rem' }}>
          <ImageClip
            x={this.state.posInfo.x}
            y={this.state.posInfo.y}
            width={this.state.posInfo.width}
            height={this.state.posInfo.height}
            src="./demo.jpeg"
            canOverClip={this.state.canOverClip}
            onChange={this.handleChange}
            getDataURLDelegator={getImageData => this.getImageData = getImageData}
            ratio={this.state.ratio ? eval(this.state.ratio) : undefined}
          />
          <button onClick={this.showClippedImage}>show clipped image</button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.querySelector('#react-content'))
