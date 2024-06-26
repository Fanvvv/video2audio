<script setup lang="ts">
import { ref } from 'vue'

interface IList {
    name: string
    path?: string
}


const inputPath = ref<string>('')
const outputPath = ref<string>("")
const list = ref<IList[]>([])

async function selectFileInputPath() {
    // 实现文件选择逻辑
    const input = await window.ipcRenderer.invoke('select-file-input-path')
    list.value = input
    inputPath.value = input[0].path
}

async function selectFolderInputPath() {
    // 实现文件夹选择逻辑
    const input = await window.ipcRenderer.invoke('select-folder-input-path')
    list.value = input.files
    inputPath.value = input.path
}

// 选择输出路径
async function selectOutputPath() {
    const output = await window.ipcRenderer.invoke('select-output-path')
    outputPath.value = output
}

// 格式转换
async function video2audio() {
    // 实现格式转换逻辑
    console.log('开始转换')
}
</script>

<template>
    <div>
        <div flex="~ items-center" gap-2>
            <div text-base w-40>输入路径：</div>
            <input input-base type="text" v-model="inputPath" placeholder="请选择输入路径" disabled />
            <button btn-solid w-50 @click="selectFileInputPath">获取文件</button>
            <button btn-solid w-50 @click="selectFolderInputPath">获取文件夹</button>
        </div>
        
        <div flex="~ items-center" gap-2 my-2>
            <div text-base w-40>输出路径：</div>
            <input input-base type="text" v-model="outputPath" placeholder="请选择输出路径(默认为输入路径)" disabled />
            <button btn-solid w-112 @click="selectOutputPath">选择输出文件夹</button>
        </div>

        <div mt-5>
            <div my-3>
                <div>输入文件列表：</div>
                <button btn-solid w-112 @click="video2audio">转换</button>
            </div>
            <div w-full h-60 overflow-y-scroll border border-solid border-base>
                <div grid grid-cols-2 w-full py-2 v-for="(item, index) in list" :key="index">
                    <div w-full truncate>{{ item.name }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
</style>
