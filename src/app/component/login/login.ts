import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { loginRequest } from '../../model/request/auth-request.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  errorMessage = signal("")
  loading = signal(false)
  form: FormGroup

    constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
    username: ["", Validators.required],
    password: ["", Validators.required]
  });
}

  onSubmit(){
    console.log('submit dipanggil, valid:', this.form.valid, 'value:', this.form.value);

  this.loading.set(true);
  this.errorMessage.set("");

    this.authService.loginEmploye(this.form.getRawValue() as loginRequest).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.role === 'SUPERADMIN' || res.role === 'BACKOFFICE') {
          this.router.navigate(['/master/dashboard']);
        } else {
          this.errorMessage.set("role tidak dikenal")
        }
        
        console.log("OK")
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? "username atau password salah");
      }
    })
  }


}
