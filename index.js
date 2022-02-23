// Standard
const path = require('path')
const fs = require('fs')

// NPM
const { Client: FTPClient } = require('basic-ftp')

const action = async context => {
  // Do something
  context.setProgress('Uploading...')

  const config = context.config

  // About the file
  const sourcePath = await context.filePath()
  const sourceName = path.basename(sourcePath)

  // File Out
  const destName = sourceName

  const uploadURL = config.get('baseUrl') + destName

  context.setProgress(destName)

  const ftp = new FTPClient(5000)

  await ftp.access({
    host: config.get('hostname'),
    port: config.get('port'),
    user: config.get('username'),
    password: config.get('password')
  })

  const uploadPath = config.get('path')

  if (uploadPath) {
    try {
      await ftp.ensureDir(path)
    } catch (error) {
    }
  }

  context.setProgress('Connecting to FTP...')

  context.setProgress('Uploading file...', 0)

  const maxBytes = fs.statSync(sourcePath).size

  context.setProgress(`${maxBytes}`)

  ftp.trackProgress(progress => {
    context.setProgress('Uploading file...', progress.bytes / maxBytes)
  })

  try {
    await ftp.uploadFrom(sourcePath, destName)
  } catch (error) {
  }

  // Cleanup
  ftp.close()

  // For the user
  context.copyToClipboard(uploadURL)

  // Messages
  context.notify('FTP Upload Complete.')
  context.setProgress('FTP Upload Complete', 100)
}

const config = {
  hostname: {
    title: 'Hostname',
    type: 'string',
    default: '',
    required: true,
    minLength: 2
  },
  port: {
    title: 'Port',
    type: 'number',
    default: 21,
    required: true
  },
  username: {
    title: 'Username',
    type: 'string',
    default: undefined,
    required: false
  },
  password: {
    title: 'Password',
    type: 'string',
    default: undefined,
    required: false
  },
  path: {
    title: 'Path',
    type: 'string',
    default: undefined,
    required: false
  },
  baseUrl: {
    title: 'Base URL',
    type: 'string',
    default: '',
    required: true,
    minLength: 2
  }
}

const ftp = {
  title: 'Share to FTP',
  formats: ['gif', 'mp4', 'webm', 'apng'],
  action,
  config
}

exports.shareServices = [ftp]
