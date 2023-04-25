import request from '@/utils/request'


export function publishToMqtt(params) {
    params
    return request({
        url: '/mqtt/publish',
        method: 'post',
        data: params
    })
}

export function getFrames(params) {
    params
    return request({
        url: '/downlink',
        method: 'post',
        data: params
    })
}