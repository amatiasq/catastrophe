import './App.css';

import { bind } from 'bind-decorator';
import * as React from 'react';
import TaskManager from '../game/tasks/index';
import TaskWalk from '../game/tasks/task-walk';
import TaskWallBuild from '../game/tasks/task-wall-build';
import TaskWallDemolish from '../game/tasks/task-wall-demolish';
import game from './init-game';

const TOOLS: Tool[] = [{
  id: 'build',
  label: 'Build wall',
  class: TaskWallBuild,
}, {
  id: 'demolish',
  label: 'Demolish wall',
  class: TaskWallDemolish,
}, {
  id: 'walk',
  label: 'Walk',
  class: TaskWalk,
}];

export default class App extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);

    (window as any).tool = TOOLS[0];
    this.state = {
      tool: TOOLS[0],
      tasks: game.tasks,
    };
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

    // const tasks = [];

    // for (const task of this.state.tasks) {
    //   tasks.push(<li>{task.constructor.name}: {task.needsWorkers()}</li>);
    // }

    return (
      <div className="app">
        <nav>{tools}</nav>
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
  tool: Tool;
  tasks: TaskManager;
}

interface Tool {
  id: string;
  label: string;
  class: Function;
}