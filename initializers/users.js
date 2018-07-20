'use strict'

const crypto              = require('crypto')
const {Initializer, api}  = require('actionhero')
const uniqid              = require('uniqid')

module.exports = class InitUsers extends Initializer {
  constructor () {
    super()
    this.name = 'users'
    this.saltRounds = 10
    this.usersHash = 'users'
  }

  async initialize () {
    const redis = api.redis.clients.client

    api.users = {}

    api.users.add = async (email, password) => {
      const savedUser = await redis.hget(this.usersHash, email)
      if (savedUser) { throw new Error('user already exists') }
      const hashedPassword = await api.users.cryptPassword(password)
      const data = {
        email: email,
        user_id: uniqid(),
        hashedPassword: hashedPassword,
        createdAt: new Date().getTime()
      }

      await redis.hset(this.usersHash, email, JSON.stringify(data))
      return data
    }

    api.users.edit = async (email, name, city, birthday, bio, gender) => {
      if (!email) { throw new Error('no username provided') }
      const savedUser = await redis.hget(this.usersHash, email)
      if (!savedUser) { throw new Error('user not found') }

      const data = {
        name: name,
        city: city,
        birthday: birthday,
        bio: bio,
        gender: gender
      }

      await redis.hset(this.usersHash, email, JSON.stringify(data))
      return data
    }

    api.users.like = async (email, match_id) => {
      if (!email) { throw new Error('no username provided') }
      const savedUser = await redis.hget(this.usersHash, email)
      if (!savedUser) { throw new Error('user not found') }

      const data = {
        your_new_like: match_id
      }

      //await redis.lpush(this.usersHash, email, JSON.stringify(data))
      return data
    }

    api.users.list = async () => {
      const userData = await redis.hgetall(this.usersHash)
      return Object.keys(userData).map((k) => {
        let data = JSON.parse(userData[k])
        delete data.hashedPassword
        return data
      })
    }

    api.users.fetch = async (email) => {
      if (!email) { throw new Error('no username provided') }
      let savedUser = await redis.hget(this.usersHash, email)
      if (!savedUser) { throw new Error('user not found') }
      console.log(savedUser)
      return savedUser
    }

    api.users.authenticate = async (email, password) => {
      try {
        let data = await redis.hget(this.usersHash, email)
        data = JSON.parse(data)
        return api.users.comparePassword(data.hashedPassword, password)
      } catch (error) {
        throw new Error(`userName does not exist (${error})`)
      }
    }

    api.users.delete = async (userName, password) => {
      try {
        await redis.del(this.usersHash, userName)
      } catch (error) {
        throw new Error(`Error deleting user (${error})`)
      }
    }

    api.users.cryptPassword = async (password) => {
      //return bcrypt.hash(password, this.saltRounds)
      return crypto.randomBytes(16).toString('hex');
    }

    api.users.comparePassword = async (hashedPassword, userPassword) => {
      //return bcrypt.compare(userPassword, hashedPassword)
    }
  }

  async start () {
    // connect
  }
  async stop () {
    // disconnect
  }
}
