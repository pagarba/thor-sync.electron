<template>
    <v-container>
        <v-layout row justify-center>
            <v-flex sm12>
                <v-toolbar>
                    <v-toolbar-title>Shortcuts</v-toolbar-title>
                    <v-divider class="mx-3" inset vertical></v-divider>
                    <span>Your favourite DApp will appear below</span>
                    <v-spacer/>
                    <NewShortcutDialog
                        @cancel="onCancelEdit"
                        :editItem="editItem"
                        v-model="dialog"
                    />
                </v-toolbar>
                <v-data-table hide-actions width="800px" :headers="headers" :items="rows">
                    <template slot="items" slot-scope="props">
                        <td class="text-xs-center">{{props.item.value.name}}</td>
                        <td class="text-xs-center">{{props.item.value.href}}</td>
                        <td class="text-xs-center">
                            <v-btn
                                dark
                                small
                                icon
                                color="blue-grey lighten-3"
                                @click="onEdit(props.item)"
                            >
                                <v-icon small>edit</v-icon>
                            </v-btn>
                            <v-btn
                                @click="onDelete(props.item)"
                                dark
                                small
                                icon
                                color="blue-grey lighten-3"
                            >
                                <v-icon small>delete</v-icon>
                            </v-btn>
                        </td>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
        <ConfirmDialog max-width="300px" ref="confirm"/>
    </v-container>
</template>
<script lang="ts">
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { Entities } from '../database'
import NewShortcutDialog from './NewShortcutDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import TableLoader from '../mixins/table-loader'

@Component
class ShortcutsLoader extends TableLoader<Entities.Preference<'shortcut'>> {
    tableName = GDB.preferences.name
    filter = () =>
        GDB.preferences
            .where('key')
            .equals('shortcut')
            .reverse()
            .sortBy('id')
}

@Component({
    components: {
        NewShortcutDialog,
        ConfirmDialog
    }
})
export default class Shortcuts extends Mixins(ShortcutsLoader) {
    dialog = false

    editItem: Entities.Preference | null = null

    headers = [
        {
            text: 'Name',
            value: 'name',
            align: 'center',
            sortable: false
        },
        {
            text: 'Absolute domain name',
            value: 'domain',
            align: 'center',
            sortable: false
        },
        {
            text: 'Actions',
            value: 'name',
            align: 'center',
            sortable: false
        }
    ]

    onEdit(val: Entities.Preference<'shortcut'>) {
        this.editItem = val
        this.dialog = true
    }

    onCancelEdit() {
        this.editItem = null
    }

    async onDelete(item: Entities.Preference) {
        let conDig = this.$refs.confirm as ConfirmDialog
        conDig.confirm().then(
            () => {
                return GDB.preferences.delete(item.id as any)
            },
            () => {
                console.log('cancel')
            }
        )
    }
}
</script>
