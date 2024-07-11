import { useParams } from 'react-router-dom'
import EditNoteForm from './EditNoteForm'
import useAuth from '../../hooks/useAuth'
import { useGetNotesQuery } from './notesApiSlice'
import { useGetUsersQuery } from '../users/usersApiSlice'
import PulseLoader from "react-spinners/PulseLoader"

const EditNote = () => {
    const { id } = useParams()
    const { username, isManager, isAdmin } = useAuth()
    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: data?.entities[id]
        })
    })

    const { users } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            users: data?.ids.map(id => data?.entities[id])
        })
    })

    if (!note || !users?.length) return <PulseLoader color={"#fff"} />

    if (!isManager && !isAdmin) {
        if (note.username !== username) {
            return <p className="errmsg">No Access</p>
        }
    }

    const content = note && users ? <EditNoteForm note={note} users={users} /> : <p>Loading...</p>

    return content
}
export default EditNote