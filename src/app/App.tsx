import './App.css';

import { bind } from 'bind-decorator';
import * as React from 'react';
import TaskWallBuild from '../game/tasks/wall-build';
import TaskWallDemolish from '../game/tasks/wall-demolish';

const TOOLS: Tool[] = [{
  id: 'build',
  label: 'Build wall',
  class: TaskWallBuild,
}, {
  id: 'demolish',
  label: 'Demolish wall',
  class: TaskWallDemolish,
}];

export default class App extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);

    (window as any).tool = TOOLS[0];
    this.state = { tool: TOOLS[0] };
  }

  render() {

    const tools = TOOLS.map(tool => {
      return (
        <button
          key={tool.id}
          disabled={this.state.tool === tool}
          onClick={() => this.setTool(tool)}
        >
          {tool.label}
        </button>
      );
    });

    return (
      <div className="app">
        <nav>
          {tools}
        </nav>
      </div>
    );
  }

  @bind
  private setTool(tool: Tool) {
    this.setState({ tool });
    (window as any).tool = tool;
  }

}

interface AppProps { }

interface AppState {
  tool?: Tool;
}

interface Tool {
  id: string;
  label: string;
  class: Function;
}