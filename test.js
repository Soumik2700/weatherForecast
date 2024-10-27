const nums1 = [1, 2, 3, 0, 0, 0];
const nums2 = [2, 5, 6];

let i = 0;
let j = 0;
const resultArray = [];
while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j] && nums1[i] != 0) {
        resultArray.push(nums1[i]);
        i++;
    } else {
        if (nums2[j] <= nums1[i] && nums2[j] != 0) {
            resultArray.push(nums2[j]);
            j++;
        }
    }
}
console.log(resultArray);