import * as React from 'react'
import { Form, Button, Input, Grid, Divider } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchMemory } from '../api/memories-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditMemoryProps {
  match: {
    params: {
      memoryId: string
    }
  }
  history: {
    location: {
      state: {
        memory: any
      }
    }
  }
  auth: Auth
}

interface EditMemoryState {
  name: string
  file: any
  uploadState: UploadState
}

export class EditMemory extends React.PureComponent<
  EditMemoryProps,
  EditMemoryState
> {
  state: EditMemoryState = {
    name: this.props.history.location.state.memory.name,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.memoryId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  onMemoryUpdate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      await patchMemory(this.props.auth.getIdToken(), this.props.match.params.memoryId, {
        name: this.state.name
      })
      alert('Memory updated!')
    } catch {
      alert('Memory update failed')
    }
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value })
  }

  render() {
    return (
      <div>
        <Grid.Row>
          <Grid.Column width={16}>
            <Input
                action={{
                  color: 'teal',
                  content: 'Update',
                  onClick: this.onMemoryUpdate
                }}
                value={this.state.name}
                onChange={this.handleNameChange}
                fluid
                placeholder="Memory Name"
              />
          </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
