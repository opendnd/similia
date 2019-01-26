import React, { Component } from 'react';
import { roll } from '@opendnd/core';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import './App.css';

const blockSize = 25;
let interval;
const timer = 50;

class App extends Component {
  constructor(props) {
    super(props);

    const width = Math.floor(window.innerWidth/blockSize);
    const height = Math.floor(window.innerHeight/blockSize);

    const grid = Array(width).fill(undefined);
    grid.forEach((_, i) => {
      grid[i] = new Array(height).fill({ color: '#86BB8C' });
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
    const { domains:domainsDict, width, height } = this.state;

    const domains = Object.values(domainsDict);

    if (domains.length < 5) if (roll('1d20') > 10) this.createDomain();

    if (domains.length > 0) {
      const rdomain = domains[(roll(`1d${domains.length}`) - 1)];
      const { cells, id:domainId } = rdomain;
      const rcell = cells[(roll(`1d${cells.length}`) - 1)];
      const xd = 2 - roll('1d3');
      const yd = 2 - roll('1d3');
      const { x:x1, y:y1 } = rcell;
      let x2 = x1 + xd;
      let y2 = y1 + yd;
      const distance = Math.hypot(x2-x1, y2-y1);

      if (distance > 1) {
        if (roll('1d2') === 1) {
          if (xd > 0) {
            x2 -= 1;
          } else {
            x2 += 1;
          }
        } else {
          if (yd > 0) {
            y2 -= 1;
          } else {
            y2 += 1;
          }
        }
      }

      if (
        (x2 >= 0) && 
        (y2 >= 0) &&
        (x2 < width) &&
        (y2 < height)
      ) {
        this.takeCell(x2, y2, domainId);
      }
    }
  }

  createDomain = () => {
    const { width, height } = this.state;
    const x = roll(`1d${width}`) - 1;
    const y = roll(`1d${height}`) - 1;

    const id = Object.keys(this.state.domains).length;
    const domain = {
      id,
      capital: {
        x, y,
      },
      color: Konva.Util.getRandomColor(),
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
    const { color } = domain;
    const cell = this.getCell(x, y);
    cell.color = color;
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
        <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            {
              grid.map((column, x) => {
                return (
                  column.map((cell, y) => {
                    const { color } = cell;

                    return (
                      <Rect
                        x={x*blockSize}
                        y={y*blockSize}
                        key={`${x}-${y}`}
                        width={blockSize}
                        height={blockSize}
                        fill={color}
                      />
                    )
                  })
                )
              })
            }
          </Layer>
        </Stage>
      </div>
    );
  }
}

export default App;
