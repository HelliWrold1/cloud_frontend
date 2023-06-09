import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function registerUser(params) {
  return request({
    url: '/user/register',
    method: 'post',
    data:params
  })
}

export function updateUser(params) {
  return request({
    url: '/user/' + params.id,
    method: 'put',
    data: params
  })
}

export function changeUser(params) {
  return request({
    url: '/user/update',
    method: 'put',
    data:params
  })
}

export function getUsers(params) {
  return request({
    url: '/users',
    method: 'post',
    data: params
  })
}

export function deleteUser(params) {
  return request({
    url: '/user/' + params,
    method: 'delete',
  })
}
