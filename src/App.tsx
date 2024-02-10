import { useState, useEffect } from 'react';
import { useLazyQuery, ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/graphql',
  cache: new InMemoryCache()
});

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
      native
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
`;
interface Language {
  code: string;
  name: string;
}
interface Country {
  code: string;
  name: string;
  native: string;
  emoji: string;
  currency: string;
  languages: Language[];
}

const predifenedColors = ['#ce5008', '#1706aa', '#047a18', '#720436', '#e50938'];

const App= () => {
  const [filter, setFilter] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [getCountries, { loading, data }] = useLazyQuery(GET_COUNTRIES, { client });

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  const inputFilter = (value: string) => {
    setFilter(value);
  };

  const countrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

  useEffect(() => {
    if (data && data.countries) {
      let defaultSelectionIndex = 9;
      const filteredCountries = data.countries.filter((country: Country) =>
        country.name.toLowerCase().includes(filter.toLowerCase())
      );

      if (filteredCountries.length < 10) {
        defaultSelectionIndex = Math.max(filteredCountries.length - 1, 0);
      }

      setSelectedCountry(filteredCountries[defaultSelectionIndex]?.code || null);
    }
  }, [data, filter]);

  return (
    <div className="container mx-auto p-4">
      <input
        type="text"
        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
        placeholder="Filter countries..."
        value={filter}
        onChange={(e) => inputFilter(e.target.value)}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.countries
            .filter((country: Country) =>
              country.name.toLowerCase().includes(filter.toLowerCase())
            )
            .map((country: Country, index) => (
              <li
              className='p-4 rounded-md border border-gray-300 cursor-pointer'
                key={country.code}
                style={{
                  backgroundColor:
                    selectedCountry === country.code
                      ? predifenedColors[data?.countries.indexOf(country) % predifenedColors.length]
                      : 'transparent',
                }}
                onClick={() => countrySelect(country.code)}
              >
              {index +1} - {country.name} ( {country.emoji} )
              </li>
            ))}
          {data && !data.countries.some((country: Country) =>
            country.name.toLowerCase().includes(filter.toLowerCase())
          ) && (
            <li className='p-4 rounded-md border border-gray-300'>Country not found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default App;
