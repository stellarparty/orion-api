'use strict'
const {api, Action}   = require('actionhero')
const addSubtractDate = require("add-subtract-date")

class ValidatedAction extends Action {
  constructor () {
    super()
    this.inputs = {
      email: {
        required: true,
        validator: this.emailValidator
      },
      password: {
        required: true,
        validator: this.passwordValidator
      }
    }
  }

  emailValidator (param) {
    if (param.indexOf('@') < 0) {
      throw new Error('that is not a valid email address')
    }
  }

  passwordValidator (param) {
    if (param.length < 6) {
      throw new Error('password should be at least 5 letters long')
    }
  }
}

exports.userAdd = class UserAdd extends ValidatedAction {
  constructor () {
    super()
    this.name = 'userAdd'
    this.description = 'I add a user'
    this.outputExample = {}
    this.authenticated = false
  }

  async run ({response, params}) {
    let user = await api.users.add(params.email, params.password)
    response.user = user
  }
}

exports.userEditDetails = class UserEditDetails extends Action {
  constructor () {
    super()
    // (required) the action's name (the \`exports\` key doesn't matter)
    this.name = 'userEditDetails'

    // (required) the description
    this.description = 'I edit user details'

    // (required) a hash of all the inputs this action will accept
    // any inputs provided to the action not in this hash will be stripped
    this.inputs = {
      email: {
        required: true
      },
      name: {
        required: false,
        validator: this.validator
      },
      city: {
        required: false,
        validator: this.validator
      },
      birthday: {
        required: false,
        validator: this.birthdayValidator
      },
      bio: {
        required: false,
        validator: this.bioValidator
      },
      gender: {
        required: false
      }
    }
  }

  validator (param) {
    if (param.length < 1) {
      throw new Error('field should be at least 1 letter long')
    }
  }

  birthdayValidator (param) {
    let date        = new Date( parseInt(param) * 1000 )
    let currentDate = new Date();
    let legalDate   = addSubtractDate.subtract(currentDate, 18, 'year')

    if(!date) {
      throw new Error('a valid date "' + date + '" was not passed')
    }

    if (date > legalDate) {
      throw new Error('you gotta be an adult')
    }
  }

  bioValidator (param) {

    const limit = 300

    if (param.length < 1) {
      throw new Error('A valid bio was not passed')
    }

    if (param.length > limit) {
      throw new Error('A bio must be under '+ limit +' characters')
    }
  }

  async run ({response, params}) {
    let user = await api.users.edit(params.email, params.name, params.city, params.birthday, params.bio, params.gender)
    response.user = user
  }
}

exports.userLike = class userLike extends Action {
  constructor () {
    super()
    this.name = 'userLike'

    this.description = 'I like a user'

    this.inputs = {
      email: { required: true },
      match_id: { required: true }
    }
  }

  async run ({response, params}) {
    let user = await api.users.like(params.email, params.match_id)
    response.user = user
  }
}

exports.userDelete = class UserDelete extends Action {
  constructor () {
    super()
    this.name = 'userDelete'
    this.description = 'I delete a user'
    this.outputExample = {}
    this.authenticated = true
    this.inputs = {
      email: {required: true},
      password: {required: true}
    }
  }

  async run ({params}) {
    await api.users.delete(params.email, params.password)
  }
}

exports.usersList = class UsersList extends Action {
  constructor () {
    super()
    this.name = 'usersList'
    this.description = 'I list all the users'
    this.outputExample = {}
    this.authenticated = false
    this.inputs = {}
  }

  async run ({response, params}) {
    let users = await api.users.list()
    response.users = users.map((user) => { return user.email })
  }
}

exports.fetchUser = class FetchUser extends Action {
  constructor () {
    super()
    this.name = 'fetchUser'
    this.description = 'I fetch a single user'
    this.outputExample = {}
    this.authenticated = false
    this.inputs = {
      email: {required: true}
    }
  }

  async run ({response, params}) {
    let user = await api.users.fetch(params.email)
    response.user = user
  }
}

exports.authenticate = class Authenticate extends Action {
  constructor () {
    super()
    this.name = 'authenticate'
    this.description = 'I authenticate a user'
    this.outputExample = {}
    this.authenticated = false
    this.inputs = {
      email: {required: true},
      password: {required: true}
    }
  }

  async run ({response, params}) {
    response.authenticated = await api.users.authenticate(params.email, params.password)
    if (!response.authenticated) { throw new Error('unable to log in') }
  }
}
