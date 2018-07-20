'use strict'

const {api, Action} = require('actionhero')

exports.logout = class Logout extends Action {
  constructor () {
    super()
    this.name = 'logout'
    this.description = 'I end the user session'
    this.outputExample = {}
    this.authenticated = false
    this.blockedConnectionTypes = []
    this.inputs = {}
  }

  async run (api, connection, next) {
    api.session.delete(connection, next)
  }

}
