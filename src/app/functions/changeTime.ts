
export function dateTimeToSeconds (time: string) {
    const nums = time.split(':')
    const seconds = 60 * 60 * Number(nums[0]) + 60 * Number(nums[1]) + Number(nums[2])
    return seconds
}
