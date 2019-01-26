import React, { Component } from 'react';
import { roll } from '@opendnd/core';
import './App.css';

const blockSize = 50;
let interval;
const timer = 500;

class App extends Component {
  constructor(props) {
    super(props);

    const width = Math.floor(window.innerWidth/blockSize);
    const height = Math.floor(window.innerHeight/blockSize);

    const grid = Array(width).fill(undefined);
    grid.forEach((_, i) => {
      grid[i] = new Array(height).fill({ backgroundColor: 'rgba(0,150,0,1)' });
    });

    this.state = {
      width,
      height,
      grid,
      domains: [],
    };
  }

  componentWillMount() {
    
    interval = setInterval(this.sim, timer);
  }

  componentWillUnmount() {
    clearInterval(interval);
  }

  sim = () => {
    const { domains, width, height } = this.state;
    // roll d20 and do a DC10
    if (roll('1d20') > 10) this.random();

    Object.values(domains).forEach((domain, domainId) => {
      const { cells } = domain;
      const rcell = cells[(roll(`1d${cells.length}`) - 1)];
      const x = (roll('1d3') - 2) + rcell.x;
      const y = (roll('1d3') - 2) + rcell.y;

      if (
        (x >= 0) && 
        (y >= 0) &&
        (x < width) &&
        (y < height)
      ) {
        this.takeCell(x, y, domainId);
      }
    });
  }

  random = () => {
    const { width, height } = this.state;
    const x = roll(`1d${width}`) - 1;
    const y = roll(`1d${height}`) - 1;
    const r = roll('1d255');
    const g = roll('1d255');
    const b = roll('1d255');

    const id = Object.keys(this.state.domains).length;
    const domain = {
      id,
      capital: {
        x, y,
      },
      colors: {
        r, g, b,
      },
      cells: [
        {
          x, y,
        },
      ],
    };

    this.setState({
      ...this.state,
      domains: {
        ...this.state.domains,
        [id]: domain,
      },
    }, () => {
      this.takeCell(x, y, id);
    });
  }

  takeCell = (x, y, domainId) => {
    const domain = this.state.domains[domainId];
    const { colors } = domain;
    const { r, g, b } = colors;
    const cell = this.getCell(x, y);
    cell.backgroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
    cell.ownerId = domainId;
    this.updateCell(x, y, cell);
    this.removeCell(x, y, domainId);
    this.updateDomain(domainId, {
      ...domain,
      cells: [
        ...domain.cells,
        {
          x, y,
        },
      ],
    });
  }

  removeCell = (x, y, domainId) => {
    const domain = this.state.domains[domainId];
    this.updateDomain( domainId, {
      ...domain,
      cells: domain.cells.filter((cell, i) => {
        return !((cell.x === x) && (cell.y === y));
      }),
    })
  }

  getCell = (x, y) => {
    const column = this.state.grid[x];
    const cell = column[y];

    return Object.assign({}, cell);
  }

  updateCell = (x, y, newCell) => {
    this.setState({
      ...this.state,
      grid: this.state.grid.map((column, i) => {
        if (i === x) {
          return column.map((cell, j) => {
            if (j === y) return newCell;
            return cell;
          });
        }

        return column;
      }),
    });
  }

  updateDomain = (domainId, newDomain) => {
    this.setState({
      ...this.state,
      domains: {
        ...this.state.domains,
        [domainId]: newDomain,
      },
    });
  }

  render() {
    const  { grid } = this.state;

    return (
      <div className="App">
        <div className="Grid">
          {
            grid.map((column, key) => {
              return (
                <div className="Column" key={key}>
                  {
                    column.map((cell, key) => {
                      const { backgroundColor } = cell;

                      return (
                        <div className="Block" key={key} style={{ backgroundColor }}></div>
                      )
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
