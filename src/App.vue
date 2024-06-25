<script setup lang="ts">
import { ref } from 'vue'

const type = ref<string>('file')
const inputPath = ref<string>('')
const outputPath = ref<string>("")
const list = ref<Record<'name' | 'path', string>[]>([])

async function selectFileInputPath() {
    // 实现文件选择逻辑
    const input = await window.ipcRenderer.invoke('select-file-input-path')
    list.value = input
    inputPath.value = input[0].path
}

async function selectFolderInputPath() {
    // 实现文件夹选择逻辑
    const input = await window.ipcRenderer.invoke('select-folder-input-path')

    console.log(input);
}

// 选择输出路径
async function selectOutputPath() {
    const output = await window.ipcRenderer.invoke('select-output-path')
    outputPath.value = output
}
</script>

<template>
    <div>
    <div flex="~ items-center" gap-2 mb-5>
            <div>选择输入路径的类型：</div>
            <div>
                <button :class="type === 'file' ? 'btn-solid' : 'btn-outline'" @click="type = 'file'">文件</button>
                <button :class="type === 'folder' ? 'btn-solid' : 'btn-outline'" @click="type = 'folder'">文件夹</button>
            </div>
        </div>
        <div v-if="type === 'file'" flex="~ items-center" gap-2>
            <div text-base w-35>输入路径：</div>
            <input input-base type="text" v-model="inputPath" placeholder="请选择输入路径" disabled />
            <button btn-solid w-60 @click="selectFileInputPath">获取文件</button>
        </div>
        <div v-if="type === 'folder'" flex="~ items-center" gap-2>
            <div text-base w-35>输入路径：</div>
            <input input-base type="text" v-model="inputPath" placeholder="请选择输入路径" disabled />
            <button btn-solid w-60 @click="selectFolderInputPath">获取文件夹</button>
        </div>
        
        <div flex="~ items-center" gap-2 my-2>
            <div text-base w-35>输出路径：</div>
            <input input-base type="text" v-model="outputPath" placeholder="请选择输出路径(默认为输入路径)" disabled />
            <button btn-solid w-60 @click="selectOutputPath">选择输出文件夹</button>
        </div>

        <div mt-5>
            <div my-3>输入文件列表：</div>
            <div w-full h-60 overflow-y-scroll border border-solid border-base>
                <div grid grid-cols-2 w-full py- v-for="(item, index) in list" :key="index">
                    <div>{{ item.name }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
</style>
