import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {

  private fb = inject( FormBuilder );
  private authService = inject( AuthService );
  private router = inject( Router );

  public myForm: FormGroup = this.fb.group({
    name:     ['', [Validators.required]],
    email:    ['', [ Validators.required, Validators.email ]],
    password: ['', [ Validators.required, Validators.minLength(6) ]],
  });

  register() {

    const { name, email, password } = this.myForm.value;

    this.authService.register( name, email, password)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado con exito',
            text: 'Ya puedes iniciar sesión'
          })
          this.router.navigateByUrl('/auth/login')
        },
        error: ( ErrorMessage ) => {
          Swal.fire('Error', ErrorMessage, 'error' )
        }
      })

  }






}
