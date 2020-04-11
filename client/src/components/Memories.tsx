import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createMemory, deleteMemory, getMemories, patchMemory } from '../api/memories-api'
import Auth from '../auth/Auth'
import { Memory } from '../types/Memory'

interface MemoriesProps {
  auth: Auth
  history: History
}

interface MemoriesState {
  memories: Memory[]
  newMemoryName: string
  date: Date
  loadingMemories: boolean
  imageError: boolean
}

export class Memories extends React.PureComponent<MemoriesProps, MemoriesState> {
  state: MemoriesState = {
    memories: [],
    newMemoryName: '',
    date: new Date(),
    loadingMemories: true,
    imageError: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newMemoryName: event.target.value })
  }

  onEditButtonClick = (memoryId: string) => {
    this.props.history.push(`/memories/${memoryId}/edit`)
  }

  onMemoryCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newMemory = await createMemory(this.props.auth.getIdToken(), {
        name: this.state.newMemoryName,
        mday: `${this.state.date.getDate()}/${this.state.date.getMonth()+1}`,
        year: this.state.date.getFullYear(),
      })
      this.setState({
        memories: [...this.state.memories, newMemory],
        newMemoryName: ''
      })
    } catch {
      alert('Memory creation failed')
    }
  }

  onMemoryDelete = async (memoryId: string) => {
    try {
      await deleteMemory(this.props.auth.getIdToken(), memoryId)
      this.setState({
        memories: this.state.memories.filter(memory => memory.memoryId != memoryId)
      })
    } catch {
      alert('Memory creation failed')
    }
  }

  // onMemoryCheck = async (pos: number) => {
  //   try {
  //     const memory = this.state.memories[pos]
  //     await patchMemory(this.props.auth.getIdToken(), memory.memoryId, {
  //       name: memory.name
  //     })
  //     this.setState({
  //       memories: update(this.state.memories, {
  //         [pos]: { done: { $set: !memory.done } }
  //       })
  //     })
  //   } catch {
  //     alert('Memory deletion failed')
  //   }
  // }

  async componentDidMount() {
    try {
      const memories = await getMemories(this.props.auth.getIdToken(), this.state.date.getDate(), this.state.date.getMonth()+1)
      this.setState({
        memories,
        loadingMemories: false
      })
    } catch (e) {
      alert(`Failed to fetch memories: ${e.message}`)
    }
  }

  onChange = async (date: any) => {
    this.setState({ date, loadingMemories: true })
    try {
      const memories = await getMemories(this.props.auth.getIdToken(), date.getDate(), date.getMonth()+1)
      this.setState({
        memories,
        loadingMemories: false
      })
    } catch (e) {
      alert(`Failed to fetch memories: ${e.message}`)
    }
    return
  }

  divStyle = {
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center'
  };

  render() {
    return (
      <div>
        <div style={this.divStyle}>
          <Calendar
            onChange={this.onChange}
            value={this.state.date}
          />
        </div>
        <Header as="h1" textAlign='center'>Memories in {this.state.date.getDate()}/{this.state.date.getMonth() + 1}</Header>
        {this.renderCreateMemoryInput()}

        {this.renderMemories()}
      </div>
    )
  }

  renderCreateMemoryInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New memory',
              onClick: this.onMemoryCreate
            }}
            value={this.state.newMemoryName}
            fluid
            placeholder="Memory Name"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderMemories() {
    if (this.state.loadingMemories) {
      return this.renderLoading()
    }

    return this.renderMemoriesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Memories
        </Loader>
      </Grid.Row>
    )
  }

  fallback() {
    this.setState({
      imageError: true
    })
  }

  renderMemoriesList() {
    return (
      <Grid padded>
        {this.state.memories.map((memory, pos) => {
          return (
            <Grid.Row key={memory.memoryId}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onMemoryCheck(pos)}
                  checked={memory.done}
                />
              </Grid.Column> */}
              <Grid.Column width={12} verticalAlign="middle">
                {memory.name}
              </Grid.Column>
              {/* <Grid.Column width={3} floated="right">
                {memory.dueDate}
              </Grid.Column> */}
              <Grid.Column width={2} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(memory.memoryId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onMemoryDelete(memory.memoryId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {this.state.imageError ? false:
                memory.attachmentUrl && (
                  <Image src={memory.attachmentUrl} onError={this.fallback()} size="small" wrapped />
                ) && this.setState({imageError: false})
              }
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
