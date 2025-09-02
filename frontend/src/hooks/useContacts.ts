import axios from "../auth/axios";

const useContacts = ()=>{

    //pegar todos os contatos
    const handleIndexContacts = async ()=>{
        return await axios.get("/contacts")
    }

    //criar contato
    const handleCreateContacts =  ()=>{

    }

    //atualizar contato
    const handleUpdateContacts =  ()=>{

    }

    //excluir contato
    const handleDeleteContacts =  ()=>{

    }

    return{
        handleIndexContacts,
        handleCreateContacts,
        handleUpdateContacts,
        handleDeleteContacts   
    }
}

export default useContacts