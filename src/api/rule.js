import request from '@/utils/request'

export function publishToMqtt(params) {
    params
    return request({
        url: '/mqtt/publish',
        method: 'post',
        data: params,
    })
}

export function getDownlinks(params) {
    params
    return request({
        url:'/downlinks',
        method:'post',
        data:params,
    })
}