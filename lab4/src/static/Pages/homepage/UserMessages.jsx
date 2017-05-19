class UserMessages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            files: [],
            draggedMessage: '',
            preview: undefined
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChangeMessage = this.onChangeMessage.bind(this);
        this.onChangeFiles = this.onChangeFiles.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.displayFile = this.displayFile.bind(this);
        this.displayFileById = this.displayFileById.bind(this);
    }

    onChangeMessage(event) {
        this.setState({
            message: event.target.value
        });
    }

    onChangeFiles(event) {
        if (event.target.files.length) {
            fileToDataURI(event.target.files[0], (dataURI) => {
                this.setState({preview: dataURI});
            });
        } else {
            this.setState({preview: undefined});
        }
    }

    onSubmit(event) {
        event.preventDefault();
        let dataURI = this.state.preview
        let receiver = this.props.userId;
        let content = this.state.message;
        let params = {'receiver': receiver, 'content': content};
        if (dataURI) {
            server.request('POST', '/upload_file',
                {data: encodeURIComponent(dataURI), title: '--', description: '--'}, (response) => {
                    if (response.success) {
                        params.file_id = response.data.id
                        server.request('POST', '/post_message', params, (response) => {
                            if (response.success) {
                                this.setState({preview: undefined, message: ''});
                                this.props.updateUserMessages(receiver);
                            } else {
                                this.props.onMessage('danger', response.message);
                            }
                        });
                    } else {
                        this.props.onMessage('danger', response.message);
                    }
                }
            );
        } else {
            server.request('POST', '/post_message', params, (response) => {
                if (response.success) {
                    this.setState({message: ''});
                    this.props.updateUserMessages(receiver);
                } else {
                    this.props.onMessage('danger', response.message);
                }
            });
        }
    }

    onClick(event) {
        let messageId = event.target.attributes.name.value;
        console.log(event.target.localName);
        console.log(messageId);
        let params = {id: messageId};
        server.request('POST', '/delete_message', params, (response) => {
            if (response.success) {
                this.props.onMessage('success', response.message);
                this.props.updateUserMessages(this.props.userId);
            } else {
                this.props.onMessage('danger', response.message);
            }
        })
    }

    onDragOver(event) {
        event.preventDefault();
    }

    onDrag(event) {
        if (!event.target.attributes.name) {
            return;
        }

        this.setState({draggedMessageId: event.target.attributes.name.value})
    }

    onDrop() {
        let userMessage;
        for (let message of this.props.userMessages) {
            if (message.id === this.state.draggedMessageId) {
                userMessage = message;
                break;
            }
        }

        if (!userMessage) {
            return;
        }

        if (userMessage.files) {
            let dataURI = this.props.cachedFiles[userMessage.files[0]];
            this.setState({
                message: userMessage.content,
                preview: dataURI
            });
        } else {
            this.setState({message: userMessage.content});
        }

    }

    displayFileById(fileId) {
        if (!fileId) {
            return;
        }

        let dataURI = this.props.cachedFiles[fileId]
        if (dataURI) {
            return this.displayFile(dataURI);
        }
    }


    displayFile(dataURI) {

        if (!(dataURI)) {
            return;
        }

        let fileType = getFileTypeFromURI((dataURI));
        switch (fileType) {
            case 'image':
                return <img src={(dataURI)} className='img-thumbnail'/>
            case 'audio':
                return <audio controls src={(dataURI)}/>
            case 'video':
                return <video controls className='img-thumbnail' src={(dataURI)}/>
            default:
                this.props.onMessage('danger', 'Unsupported filetype: ' + fileType)
        }
    }

    render() {
        const styleForm = {
            marginBottom: '20px'
        };
        const styleListGroup = {
            wordWrap: 'break-word'
        };
        const stylePreview = {
            overflow: 'hidden',
            maxHeight: '100px'
        };
        const styleDeleteMessage = {
            float: 'right',
            fontSize: '8pt'
        }

        return (
            <div className='col-xs-12'>
                <div className='row' onDrop={this.onDrop} onDragOver={this.onDragOver}>
                    <div className='col-xs-6'>
                        <div className='row'>
                            <RegularFormInput type='file' name='files' id='file'
                                              files={this.state.files} onChange={this.onChangeFiles}/>
                            <HorizontalSingleLabelessInputForm
                                name='message' value={this.state.message} label='Input message'
                                onSubmit={this.onSubmit} onChange={this.onChangeMessage} type='input'
                                style={styleForm}/>
                        </div>
                    </div>
                    <div className='col-xs-6' style={stylePreview}>
                        {this.displayFile(this.state.preview)}
                    </div>
                </div>

                <div className='row'>
                    <div className='list-group col'>
                        <ul className='list-group'>
                            {
                                this.props.userMessages.map((message) => {
                                    return (
                                        <li className='list-group-item'
                                            key={message.id}
                                            name={message.id}
                                            style={styleListGroup}
                                            onDrag={this.onDrag}
                                            draggable="true">
                                            <h4 className='list-group-item-heading' name={message.id}>
                                                {message.sender} <span onClick={this.onClick} name={message.id}
                                                  style={styleDeleteMessage}>Delete message</span>
                                            </h4>

                                            <h6 className='list-group-item-heading'
                                                name={message.id}
                                                style={styleListGroup}>
                                                {new Date(Math.floor(message.epoch) * 1000).toString()}
                                            </h6>
                                            <p className='list-group-item-text'
                                               name={message.id}
                                               style={styleListGroup}>
                                                {message.content}
                                            </p>
                                            {this.displayFileById(message.files[0])}
                                        </li>
                                    )
                                }).reverse()
                            }
                        </ul>
                    </div>
                </div>
            </div>
        )
            ;
    }
}