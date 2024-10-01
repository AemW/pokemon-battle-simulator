import React, { useEffect, useState } from 'react'
import Select, { MultiValue } from 'react-select'

interface PokemonOption {
  value: number
  label: string
  img: string
}

const PokemonTeamBuilder: React.FC = () => {
  const [team1, setTeam1] = useState<MultiValue<PokemonOption>>([])
  const [team2, setTeam2] = useState<MultiValue<PokemonOption>>([])
  const [apiResult, setApiResult] = useState<string>('')
  const [pokemonData, setPokemonData] = useState<PokemonOption[]>([])

  useEffect(() => {
    const fetchPokemon = async () => {
      const response = await fetch('/pokemon/list')
      if (!response.ok) {
        setApiResult('Error occurred during API call')
      }
      const data: { id: number; name: string; img: string }[] = await response.json()
      setPokemonData(data.map((pkm) => ({ value: pkm.id, label: pkm.name, img: pkm.img })))
    }
    fetchPokemon()
  }, [])

  const handleTeam1Change = (selectedOption: MultiValue<PokemonOption>) => {
    setTeam1(selectedOption || [])
  }

  const handleTeam2Change = (selectedOption: MultiValue<PokemonOption>) => {
    setTeam2(selectedOption || [])
  }

  const handleApiCall = async () => {
    try {
      const response = await fetch('/pokemon/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1: { name: 'Team 1', pokemon: team1.map((item) => item.value) },
          team2: { name: 'Team 2', pokemon: team2.map((item) => item.value) },
        }),
      })
      const data = await response.text()
      setApiResult(data)
    } catch (error) {
      console.error('Error:', error)
      setApiResult('Error occurred during API call')
    }
  }

  return (
    <div style={{ padding: '20px', width: '95%' }}>
      <h1>Pokemon Team Builder</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Team 1 */}
        <div style={{ width: '45%' }}>
          <h2>Team 1</h2>
          <Select isMulti options={pokemonData} onChange={handleTeam1Change} />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
            {team1.map((pkm) => (
              <div key={pkm.value} style={{ margin: '10px' }}>
                <img src={pkm.img} alt={pkm.label} style={{ width: '100px', height: '100px' }} />
                <p>{pkm.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 */}
        <div style={{ width: '45%' }}>
          <h2>Team 2</h2>
          <Select isMulti options={pokemonData} onChange={handleTeam2Change} />
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
            {team2.map((pkm) => (
              <div key={pkm.value} style={{ margin: '10px' }}>
                <img src={pkm.img} alt={pkm.label} style={{ width: '100px', height: '100px' }} />
                <p>{pkm.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleApiCall}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#f45b69',
          backgroundImage: 'linear-gradient(to right, #f45b69, #f25d56)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
      >
        Battle!
      </button>

      <h3>Battle Result</h3>
      <textarea style={{ width: '100%', height: '200px', marginTop: '10px' }} value={apiResult} readOnly />
    </div>
  )
}

export default PokemonTeamBuilder
