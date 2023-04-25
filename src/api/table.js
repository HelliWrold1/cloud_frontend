import request from '@/utils/request'

export function getList(params) {
  params
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}

export function getFrames(params) {
  return request({
    url: '/frames',
    method: 'post',
    data: params
  })
}

export function delelteFrame(params) {
  return request({
    url: '/frame/' + params,
    method: 'delete',
  })
}

export function getDownLinks(params) {
  console.log(params)
  return request({
    url: '/downlinks',
    method: 'post',
    data: params
  })
}

export function delelteDownlink(params) {
  return request({
    url: '/downlink/' + params,
    method: 'delete',
  })
}