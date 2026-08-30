import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

interface ViaCepAddress {
  bairro: string;
  erro?: boolean;
  localidade: string;
  logradouro: string;
  uf: string;
}

export interface AddressLookup {
  city: string;
  state: string;
  street: string;
  zone: string;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);

  getByZip(zip: string): Observable<AddressLookup | null> {
    return this.http
      .get<ViaCepAddress>(`https://viacep.com.br/ws/${zip}/json/`)
      .pipe(
        map((address) =>
          address.erro
            ? null
            : {
                city: address.localidade,
                state: address.uf,
                street: address.logradouro,
                zone: address.bairro,
              },
        ),
      );
  }
}
