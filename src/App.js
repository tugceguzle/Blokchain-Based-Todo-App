import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import TodoContract from './contract/Todo.json'; // ABI dosyanız
import './App.css';

const TODO_CONTRACT_ADDRESS = ''; // Sözleşme adresini buraya yapıştırın



function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [todoContract, setTodoContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          // Contract nesnesini oluşturun
          const todoContract = new ethers.Contract(
            TODO_CONTRACT_ADDRESS,
            TodoContract,
            signer
          );
          setTodoContract(todoContract);

          // Görevleri alın
          const tasks = await todoContract.getTasks();
          setTasks(tasks);
        } catch (error) {
          console.error('MetaMask bağlantı hatası veya sözleşme kurulumu hatası:', error);
          alert('MetaMask erişim hatası veya sözleşme kurulumu hatası. Lütfen bağlantınızı kontrol edin.');
        }
      } else {
        alert('MetaMask gerekli! Lütfen MetaMask kurun ve tekrar deneyin.');
      }
    };

    init();
  }, []);

  const addTask = async () => {
    if (todoContract && newTask) {
      try {
        const tx = await todoContract.addTask(newTask);
        await tx.wait();
        const tasks = await todoContract.getTasks();
        setTasks(tasks);
        setNewTask('');
      } catch (error) {
        console.error('Görev eklenemedi:', error);
        alert('Görev eklenirken bir hata oluştu.');
      }
    }
  };

  const completeTask = async (id) => {
    if (todoContract) {
      try {
        const tx = await todoContract.completeTask(id);
        await tx.wait();
        const tasks = await todoContract.getTasks();
        setTasks(tasks);
      } catch (error) {
        console.error('Görev tamamlanamadı:', error);
        alert('Görev tamamlanırken bir hata oluştu.');
      }
    }
  };

  return (
    <div className="App">
      <h1>Blockchain Todo</h1>
      <div>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Yeni görev ekle"
      />
      <button onClick={addTask}>Ekle</button>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            {task.content} 
            {!task.completed && <button onClick={() => completeTask(task.id)}>Tamamla</button>}
            {task.completed && <button className='bg-danger'>Tamamlandı</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;



